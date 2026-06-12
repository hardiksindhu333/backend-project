// This file configures HOW requests enter your backend before they reach routes.
// CORS → who can talk to you

// Body parsers → what data you accept

// Static → what files you serve

// Cookies → how auth works

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import { errorHandler } from "./middlewares/error.middleware.js";


const app = express()

// Security headers
app.use(helmet())

// Request logging (shorter format in production)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "tiny"))

// Basic rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
})
app.use(limiter)

// CORS: apply headers per-request (reads env at runtime to avoid startup order issues)
const getAllowedOrigins = () =>
    (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim().replace(/\/$/, ""))

app.use((req, res, next) => {
    const allowedOrigins = getAllowedOrigins()
    const origin = req.headers.origin ? req.headers.origin.replace(/\/$/, "") : null
    console.log('Request origin:', origin)
    console.log('Allowed origins:', allowedOrigins)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        res.setHeader("Access-Control-Allow-Origin", origin || allowedOrigins[0])
        res.setHeader("Access-Control-Allow-Credentials", "true")
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
        )
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires"
        )
        if (req.method === "OPTIONS") return res.sendStatus(204)
    } else {
        console.log('Origin not allowed:', origin)
    }
    next()
})

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: "true", limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Root route for browsers
app.get("/", (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ConnectSphere Backend</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f7fafc; color: #1f2937; }
          .container { max-width: 600px; margin: auto; background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
          h1 { margin-top: 0; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .label { display: block; margin: 16px 0 8px; font-weight: 600; }
          .hint { margin: 8px 0 0; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ConnectSphere Backend</h1>
          <p>This backend service is running.</p>
          <p>Use the frontend to log in and access the app.</p>
          <p class="label">Frontend URL:</p>
          <p><a href="https://connect-sphere-4or3feu3p-hardik7.vercel.app" target="_blank">https://connect-sphere-4or3feu3p-hardik7.vercel.app</a></p>
          <p class="hint">If you want to log in here, use the frontend login page instead of calling the API directly.</p>
        </div>
      </body>
      </html>
    `)
})

// Health routes
app.get("/health", (_req, res) => res.json({ status: "ok" }))
app.get("/ready", (_req, res) => res.json({ ready: true }))

//routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import tweetRoutes from "./routes/tweet.routes.js"
import likeRoutes from "./routes/like.routes.js";




app.use("/api/v1/users",userRouter)

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/dashboard", dashboardRouter);

app.use("/api/v1/playlists", playlistRoutes);

app.use("/api/v1/tweets",tweetRoutes);

app.use("/api/v1/likes", likeRoutes);



app.use(errorHandler);


export default app