import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const authMiddleware = (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Token is required for authentication.' });
    }

    try {
        // Verify token with secret from environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // Attach decoded user data to the request object
        req.user = decoded;  

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export default authMiddleware;