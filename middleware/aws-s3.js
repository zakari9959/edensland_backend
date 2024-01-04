const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");

dotenv.config();

const s3Config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_MYACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3 = new S3Client(s3Config);

const uploadFile = async function (req, res, next) {
  const putObjectParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: req.file.name,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const putObjectCommand = new PutObjectCommand(putObjectParams);
  try {
    await s3.send(putObjectCommand);
    console.log("File uploaded successfully");
    next();
  } catch (error) {
    console.error("Error uploading file:", error);
    next();
    throw error;
  }
};

const generatePresignedUrl = async (imageUrlKey) => {
  const s3Client = new S3Client(s3Config);

  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageUrlKey,
  });

  const imageUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600,
  });

  return imageUrl;
};

module.exports = { uploadFile, generatePresignedUrl };
