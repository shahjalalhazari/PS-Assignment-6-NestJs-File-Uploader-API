import { registerAs } from "@nestjs/config";

export default registerAs('spaces', () => ({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION,
    bucket: process.env.DO_SPACES_BUCKET,
    accessKey: process.env.DO_SPACES_ACCESS_KEY,
    secretKey: process.env.DO_SPACES_SECRET_KEY
}));