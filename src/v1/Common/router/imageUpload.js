const express = require("express");
const router = express.Router();

const { __requestResponse, __deleteFile } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");

const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});
const path = require("path");

const fs = require("fs");
const { __uploadImage } = require("../../../utils/multer");

async function putObjectUrl(filename, contentType, file, bucket) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, async (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: filename,
                Body: data,
                ContentType: contentType,
            });
            try {
                const response = await s3Client.send(command);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    });
}
async function getObjectUrl(key, bucket) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    const url = await s3Client.send(command);
    return url.Body;
}
const { Readable } = require("stream");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post("/AddImage", __uploadImage, async (req, res) => {
    try {
        console.log("req.files", req.files);
        const filePath = path.resolve(
            "./" + "uploads/" + req.files.file[0].filename
        );
        await putObjectUrl(
            req.files.file[0].filename,
            req.files.file[0].mimetype,
            filePath,
            "kccbucket"
        );
        __deleteFile(filePath);

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });
        return res.json(
            __requestResponse("200", __SUCCESS, {
                filename: req.files.file[0].filename,
                full_URL:
                    (process.env.NODE_ENV == "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue) +
                    req.files.file[0].filename,
                base_URL: __ImagePathDetails?.EnvSettingTextValue,
            })
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});
router.get("/RenderImage/:filename", async (req, res) => {
    const filename = req.params.filename;

    try {
        let url = await getObjectUrl(filename, "kccbucket");
        const pdfStream = Readable.from(url);
        pdfStream.pipe(res);
    } catch (error) {
        if (error.Code == "NoSuchKey") {
            return res.json(__requestResponse("500", "File not found"));
        }
        return res.json(__requestResponse("500", "Failed to download file"));
    }
});
router.post("/AddContract", __uploadImage, async (req, res) => {
    try {
        const filePath = path.resolve(
            "./" + "uploads/" + req.files.file[0].filename
        );
        await putObjectUrl(
            req.files.file[0].filename,
            req.files.file[0].mimetype,
            filePath,
            "kcc-contract"
        );
        __deleteFile(filePath);

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "FILE_PATH",
        });
        return res.json(
            __requestResponse("200", __SUCCESS, {
                filename: req.files.file[0].filename,
                full_URL:
                    __ImagePathDetails?.EnvSettingTextValue +
                    req.files.file[0].filename,
                base_URL: __ImagePathDetails?.EnvSettingTextValue,
            })
        );
    } catch (error) {
        console.log(error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});
router.get("/RenderContract/:filename", async (req, res) => {
    const filename = req.params.filename;

    try {
        let url = await getObjectUrl(filename, "kcc-contract");
        const pdfStream = Readable.from(url);
        pdfStream.pipe(res);
    } catch (error) {
        console.log(error);
        if (error.Code == "NoSuchKey") {
            return res.json(__requestResponse("500", "File not found"));
        }
        return res.json(__requestResponse("500", "Failed to download file"));
    }
});

module.exports = router;
