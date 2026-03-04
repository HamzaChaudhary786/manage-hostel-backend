import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken"
import User from "../models/authModel";


declare global {
    namespace Express {
        interface Request {
            userId: string;
            auth0Id: string;
        }
    }
}

const audience = process.env.AUTH0_AUDIENCE;
const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;

export const jwtCheck =
    audience && issuerBaseURL
        ? auth({
            audience,
            issuerBaseURL,
            tokenSigningAlg: "RS256",
        })
        : (req: Request, res: Response, next: NextFunction) => {
            console.warn(
                "AUTH0_AUDIENCE or AUTH0_ISSUER_BASE_URL is not set. Skipping Auth0 JWT verification middleware.",
            );
            next();
        };


export const jwtParse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {


    const { authorization } = req.headers;


    if (!authorization || !authorization.startsWith("Bearer")) {

        return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authorization.split(" ")[1];

    try {

        const decoded = jwt.decode(token) as jwt.JwtPayload;

        const auth0Id = decoded.sub;

        const user = await User.findOne({ auth0Id: auth0Id });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.auth0Id = auth0Id as string;
        req.userId = user._id.toString();
        next();


    } catch (error) {

        return res.status(401).json({ error: "Failed to parse token" });

    }

}