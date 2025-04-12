const express = require('express');
const connect = require('./config/connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const user = require('./models/user');
const tempUser = require('./models/tempUser');
const otpModel = require('./models/otp');
const chatRoom = require('./models/chatRoom');
const feedback = require('./models/feedback');
const notification = require('./models/notification');
const path = require('path');
const multer = require('multer');
const uploadFile = require('./cloudinary/cloudConfig');
const fs = require('fs');
const isLoggedIn = require('./middleware/auth');
const sendMail = require('./mail/sendMail');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const validator = require('validator');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const deleteFile = require('./cloudinary/deleteFile');
const verificationCode = require('./models/verificationCode');

dotenv.config();


connect();

// middlewares

app.use(cors({
  origin: 'http://10.81.80.17:3000', // Replace with your actual frontend origin if it's different
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_CSP === 'production',
  crossOriginOpenerPolicy: process.env.NODE_CSP === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_CSP === 'production',
}));


// rate limit

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: { message: "Too many login attempts. Try again later." }
});

// Allowed mime types for image files including SVG
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Uploads will be stored in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to validate file type
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    const error = 'Invalid file type!';
    error.statusCode = 400;
    return cb(error, false); // Reject file upload
  }
};



// Export the configured multer instance
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter 
});

const errorHandlingMiddleware = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({message:err})
  }
  next();
};


app.use(errorHandlingMiddleware);

// generates six digit random number

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

// socket

const isUserInRoom = (roomID, receiverId, io, userSocketMap) => {
  console.log(userSocketMap);
  const socketsInRoom = io.sockets.adapter.rooms.get(roomID); // Set of socket IDs in room
  if (!socketsInRoom) return false;

  // Check if any socket in that room belongs to userId
  for (let socketId of socketsInRoom) {
    if (userSocketMap[socketId] === receiverId) {
      return true;
    }
  }

  return false;
};

const moodList= [];
const userSocketMap = {}; // Maps socket.id to userId

io.on('connection', (socket) => {
  socket.on('user-online', async (data) => {
    const { userId, mood } = data;
    let displayName = null;
    let profileImg = null;
    // Fetch user display name from DB
    try {
      const onlineUser = await user.findById(userId);
      displayName = onlineUser?.displayName;
      profileImg = onlineUser?.profileImg;
      console.log("User online:", onlineUser?.displayName);
    } catch (error) {
      console.error("❌ Error fetching user:", error.message);
    }

    // Step 1: Find mood index
    const moodIndex = moodList.findIndex(m => m.mood === mood);

    // Step 2: If mood section exists
    if (moodIndex !== -1) {
      const existingUser = moodList[moodIndex].onlineUsers.find(u => u.userId === userId);
      if (!existingUser) {
        moodList[moodIndex].onlineUsers.push({
          socketId: socket.id,
          userId: userId,
          displayName: displayName,
          profileImg: profileImg
        });
      }
    } else {
      // Step 3: Mood section doesn't exist, create it
      moodList.push({
        mood: mood,
        onlineUsers: [{
          socketId: socket.id,
          userId: userId,
          displayName: displayName,
          profileImg: profileImg
        }]
      });
    }

    console.log("✅ Updated moodList:", moodList);

    // Send updated list of users in this mood to everyone in that mood
    const onlineUsersInMood = moodList.find(m => m.mood === mood)?.onlineUsers || [];
    io.emit(`user-list-${mood}`, onlineUsersInMood);

  });

  socket.on('disconnect', () => {
    delete userSocketMap[socket.id];

    // Loop through each mood and remove user from their onlineUsers list
    moodList.forEach((moodEntry, index) => {
      const originalLength = moodEntry.onlineUsers.length;
      moodEntry.onlineUsers = moodEntry.onlineUsers.filter(user => user.socketId !== socket.id);

      // If someone was removed, emit the updated list
      if (moodEntry.onlineUsers.length !== originalLength) {
        io.emit(`user-list-${moodEntry.mood}`, moodEntry.onlineUsers);
      }
    });

    // Optionally remove mood sections with no users
    for (let i = moodList.length - 1; i >= 0; i--) {
      if (moodList[i].onlineUsers.length === 0) {
        moodList.splice(i, 1);
      }
    }

  });

  socket.on("join-room", async ({ roomID, receiverId, senderId }) => {
     // senderId -> who is sending message(userId)
    // receiverId -> to whome message is sent
    
    socket.join(roomID);
    userSocketMap[socket.id] = senderId;
    
    // deleteing the notification
    await notification.updateOne(
      { userId: senderId },
      {
        $pull: {
          messages: { senderId: receiverId }
        }
      }
    );    

    const existingChatRoom = await chatRoom.findOne({ roomID });
    const messages = existingChatRoom ? existingChatRoom.messages : [];
    socket.emit("load-messages", messages);

  });

  socket.on("send-message", async ({ roomID, messageReceiverID, messageSenderId, message, currentTimestamp }) => {
    // senderId -> who is sending message(userId)
    // receiverId -> to whome message is sent
    const isReceiverInRoom = isUserInRoom(roomID, messageReceiverID, io, userSocketMap);
    const existingUser = await user.findOne({"_id":messageSenderId});
    const senderName = existingUser.displayName;
    const senderProfile = existingUser.profileImg;
    
    if(!isReceiverInRoom){
      const existingNotification = await notification.findOne({"userId":messageReceiverID});
      if(!existingNotification){
        const newNotification = new notification({
          "userId":receiverId,
          "messages":[{
            "senderId":messageSenderId,
            "senderName":senderName,
            "message":message,
            "createdAt":currentTimestamp
          }]
        });
        await newNotification.save();
      }else{
        existingNotification.messages.push({
            "senderId":messageSenderId,
            "senderName": senderName,
            "message":message,
            "createdAt":currentTimestamp
        });
        await existingNotification.save();
      }

    }

    const newMessage = {
      senderId:messageSenderId,
      receiverId:messageReceiverID,
      senderName:senderName,
      senderProfile:senderProfile,
      message:message,
      timestamp: currentTimestamp
    };
  
    // If room exists, push new message
    const existingChatRoom = await chatRoom.findOneAndUpdate(
      { roomID },
      { $push: { messages: newMessage } },
      { new: true, upsert: true } // create new room if it doesn't exist
    );
  
    // Broadcast to room
    io.to(roomID).emit("receive-message", newMessage);
  });

});


app.get('/mail', async (req,res) => {
  const mailRes = await sendMail("dishanksen05@gmail.com","Your Mood Match Verification Code",`Verification code:654321`);
  res.send({mailRes});
});
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','index.html'));
  });

app.get('/signup',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','signup.html'));
  });

app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','login.html'));
  });

  app.get('/forgot-password',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','forgot-password.html'));
  });

  app.get('/verify-code',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','verify-code.html'));
  });

  app.get('/reset-password',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','reset-password.html'));
  });

app.get('/moodSelector', isLoggedIn,(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','moodSelector.html'));
});

app.get('/termsAndCondition',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/html','termsAndCondition.html'));
});

app.get('/currentMood', isLoggedIn,(req,res) => {
  res.sendFile(path.join(__dirname,'./public/html','currentMood.html'));
});

app.get('/chat',(req,res) => {
  res.sendFile(path.join(__dirname,'./public/html','chat.html'));
});

app.get('/profile', isLoggedIn,(req,res) => {
  res.sendFile(path.join(__dirname,'./public/html','profile.html'));
});

app.get('/editProfile', isLoggedIn,(req,res) => {
  res.sendFile(path.join(__dirname,'./public/html','editProfile.html'));
});

app.get('/inbox', isLoggedIn,(req,res) => {
  res.sendFile(path.join(__dirname,'./public/html','inbox.html'));
});


app.post('/api/signup', upload.single('file'),async (req, res) => {
  try {
    const formData = req.body;
    const displayName = formData.displayName.toString();
    const username = formData.username.toString();
    const email = formData.email.toString();
    const contact = formData.contact;
    const password = formData.password.toString();

    
    // checking the domain
    const domain = ".iitr.ac.in";
    if(!email.includes(domain)){
      const filePath = req.file.path;
      fs.unlinkSync(filePath);
      return res.status(401).json({ message: 'Invalid Email Domain !' });
    }
    if (password.length < 6) {
      const filePath = req.file.path;
      fs.unlinkSync(filePath);
      return res.status(401).json({ message: 'Password must be at least 6 characters!' });
    }

    
    const existingUser = await user.findOne({ "email":email });
    const existingTempUser = await tempUser.findOne({ "email":email });
    const existingOtp = await otpModel.findOne({"email":email});
    if (existingUser) {
      const filePath = req.file.path;
      fs.unlinkSync(filePath);
      return res.status(401).json({ message: 'Email already in use' });
    }
    
    
    if(existingTempUser){
      await existingTempUser.deleteOne();
    }
    
    if(existingOtp){
      await existingOtp.deleteOne();
    }

    // sending Mail

    const code = generateSixDigitCode();
    const newOtp = new otpModel({email:email, otp:code, createdAt: Date.now()});
    await newOtp.save();
    await sendMail(email,"Mood Match Verification Code",`Verification code : ${code}`);

    if(req.file){
      const localFilePath = req.file.path;
      if(req.file.size >= 10485760){
        fs.unlinkSync(localFilePath);
        return res.status(413).json({ message: 'File too large' });
      }
      const secure_url = await uploadFile(localFilePath,{
        resource_type: "image",
        folder: "moodMatchImages",
        use_filename: true,
        unique_filename: false,
        flags: "attachment",
      });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new tempUser({ 
        displayName:displayName,
        userName:username,
        email:email,
        contact:contact,
        password:hashedPassword,
        profileImg:secure_url,
        createdAt: Date.now()
       });
      await newUser.save();
      return res.status(201).json({ message: `Mail sent to ${email}`, email:email });
    }else{
      const localFilePath = path.join(__dirname,'./public/assets','profile.svg');
      const secure_url = await uploadFile(localFilePath,{
        resource_type: "image",
        folder: "moodMatchImages",
        use_filename: true,
        unique_filename: false,
        flags: "attachment",
      });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new tempUser({ 
        displayName:displayName,
        userName:username,
        email:email,
        contact:contact,
        password:hashedPassword,
        profileImg:secure_url,
        createdAt: Date.now()
       });
      await newUser.save();
      return res.status(201).json({ message: `OTP sent to ${email}`, email:email });
    }

  
  } catch (error) {
    console.log(error);
    const formData = req.body;
    const email = formData.email;
    const existingOtp = await otpModel.findOne({"email":email});
    const existingUser = await tempUser.findOne({"email":email});
    if(existingOtp){
      await existingOtp.deleteOne();
    }
    if(existingUser){
      await existingUser.deleteOne();
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req,res) => {
  try {
    const {email, otp} = req.body;
    if(!otp){
      return res.status(400).json({ message: 'No OTP provided' });
    }
    const existingOtp = await otpModel.findOne({"email":email});

    if(!existingOtp){
      return res.status(400).json({ message: 'No email entry found' });
    }
    if(existingOtp.otp == otp){
      const existingUser = await tempUser.findOne({"email":email});
      const newUser = new user({
        displayName:existingUser.displayName,
        userName:existingUser.userName,
        email:existingUser.email,
        contact:existingUser.contact,
        password:existingUser.password,
        profileImg:existingUser.profileImg
      });
      await newUser.save();
      await existingUser.deleteOne({"email":email});
      await existingOtp.deleteOne({"email":email});
      return res.status(201).json({ message: 'Account Created Successfully !' });
    }else{
      const existingUser = await tempUser.findOne({"email":email});
      await existingUser.deleteOne({"email":email});
      await existingOtp.deleteOne({"email":email});
      return res.status(401).json({ message: 'Incorrect OTP' });
    }
  } catch (error) {
    const {email, otp} = req.body;
    console.error(error);
    const existingOtp = await otpModel.findOne({"email":email});
    const existingUser = await tempUser.findOne({"email":email});
    if(existingOtp){
      await existingOtp.deleteOne();
    }
    if(existingUser){
      await existingUser.deleteOne();
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/resend-otp', async (req,res) => {
  try {
    const {email} = req.body;
    
    await otpModel.deleteOne({"email":email});

    const code = generateSixDigitCode();
    const newOtp = new otpModel({email:email, otp:code});
    await newOtp.save();
    await sendMail(email,"Mood Match Verification Code",`Verification code : ${code}`);
    return res.status(201).json({ message: `OTP sent to ${email}`, email:email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/login', loginLimiter,async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'No Email Provided !' });
    }
    
    if (!password) {
      return res.status(400).json({ message: 'No Password Provided !' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format !' });
    }
    
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters!' });
    }

    const safeEmail = email.toString();

    const existingUser = await user.findOne({ "email":safeEmail });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials password' });
    }

    const token = jwt.sign({ user_id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const uniqueCookieName = `token_${existingUser._id.toString()}`;
    res.cookie(uniqueCookieName, token, {
      httpOnly: true, // For security, prevents client-side access
      secure: process.env.NODE_ENV === 'production', // Set to true in production (use HTTPS)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      sameSite: 'strict'
    });
    res.status(201).json({ message: 'Login successful' , userId: existingUser._id, profileImgUrl: existingUser.profileImg});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify', async (req,res) => {
  try{
      const userId = req.body['userId'];
      if(!userId){
        return res.status(404).json({message:'user ID not found'});
      }

      const uniqueCookieName = `token_${userId}`;
      const token = req.cookies[uniqueCookieName];
      if (!token) {
          return res.status(401).json({ message: 'Not a valid JWT token' });
      }
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) {
              if (err.name === 'TokenExpiredError') {
                  return res.status(401).json({ message: 'Token has expired' });
              }
              return res.status(401).json({ message: 'Invalid token' });
          }
          const existingUser = await user.findOne({ "_id":userId });
          if(!existingUser){
            return res.status(401).json({ message: 'Not Logged In'});  
          }
          const profileImgUrl = existingUser.profileImg;
          return res.status(201).json({ message: 'Logged in', profileImg: profileImgUrl });
      });
  }catch(err){
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/notificationStatus', async (req,res) => {
  try {
    const {userId} = req.body;
    const existingNotification = await notification.findOne({"userId":userId});
    if(!existingNotification){
      return res.status(200).json({notifications:null});
    }
    return res.status(200).json({notifications:existingNotification.messages});
  } catch (error) {
    return res.status(500).json({notification:null});
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    const newFeedback = new feedback({
      email,
      subject,
      message
    });

    await newFeedback.save();

    return res.status(201).json({ message: "Your feedback has been recorded successfully!" });
  } catch (error) {
    console.error("Feedback submission error:", error); // ✅ Better error logging
    return res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/signout', (req, res) => {
  try {
      const userId = req.body['userId']; // If your cookie name is dynamic
      const uniqueCookieName = `token_${userId}`; // Construct the cookie name
      res.cookie(uniqueCookieName, '', {
          httpOnly: true, // Same options as the original cookie
          secure: true, // Should be true in production with HTTPS
          expires: new Date(0), // Set expiration to a past date
          sameSite: 'strict',
      });
      return res.status(201).json({ message: 'Logged out' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/profile', async (req,res) => {
  try {
    const {userId} = req.body;
    const existingUser = await user.findOne({"_id":userId});
    if(!existingUser){
      return res.status(401).json({message:"no such user"});
    }
    return res.status(201).json({message:"user found", 
      displayName:existingUser.displayName, 
      userName:existingUser.userName, 
      contact:existingUser.contact, 
      email:existingUser.email,
      profileImg:existingUser.profileImg})
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"server error"});
  }
});

app.post('/api/editProfile', upload.single('file'),async (req,res) => {
  try {
    const formData = req.body;
    const userId = formData.userId;
    const displayName = formData.displayName;
    const userName = formData.userName;
    const phone = isNaN(Number(formData.phone)) ? null : Number(formData.phone);
    const email = formData.email;
    console.log(displayName,userName,phone,email);
    let profileImg = null;
    if(req.file){
      const localFilePath = req.file.path;
      if(req.file.size >= 10485760){
        fs.unlinkSync(localFilePath);
        return res.status(413).json({ message: 'File too large' });
      }
      const secure_url = await uploadFile(localFilePath,{
        resource_type: "image",
        folder: "moodMatchImages",
        use_filename: true,
        unique_filename: false,
        flags: "attachment",
      });

      profileImg = secure_url;
    }
    
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (userName) updateData.userName = userName;
    if (email) updateData.email = email;
    if (!isNaN(Number(formData.phone))) updateData.contact = Number(formData.phone);
    if (profileImg) updateData.profileImg = profileImg;

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(201).json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/inbox', async (req,res) => {
  try {
    const {userId} = req.body;
    if(!userId){
      return res.status(400).json({message:"No User ID"});
    }
    const existingChatRoom = await chatRoom.find({ roomID: { $regex: userId}});
    if(!existingChatRoom){
      return res.status(400).json({message:"No Chats"});
    }
    return res.status(201).json({message:existingChatRoom});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal Server Error"});
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await user.findOne({ email });
    if (!existingUser) return res.status(401).json({ message: "User not found" });
  
    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    const existingCode = await verificationCode.findOne({"email":email});

    if(existingCode){
      await existingCode.deleteOne();
    }

    const newCode = verificationCode({email:email,code:code,createdAt:Date.now()});
    await newCode.save();
    
    sendMail(email, "Password Reset Code", `Your code: ${code}`);

    return res.status(201).json({ message: `Verification Code Sent to ${email}` });
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"Internal Server Error"});
  }
});

// Step 2: Verify code
app.post("/api/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const existingCode = await verificationCode.findOne({"email":email});
  
    if (!existingCode) return res.status(401).json({ message: "Code expired" });
    if(existingCode.code != code){
      return res.status(401).json({ message: "Invalid code" });
    }
  
    return res.status(201).json({ message: "Code verified" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Step 3: Update password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const existingCode = await verificationCode.findOne({"email":email});
  
    if (!existingCode) return res.status(401).json({ message: "Code expired" });
    if(existingCode.code != code){
      return res.status(401).json({ message: "Invalid code" });
    }
    await existingCode.deleteOne();
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.updateOne({ email }, { password: hashedPassword });
  
    return res.status(201).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname,'./public/html','404.html'));
});

server.listen(process.env.PORT,() => {
    console.log("http://localhost:3000");
})

module.exports = server;