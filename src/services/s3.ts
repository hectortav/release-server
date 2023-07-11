import AWS from "aws-sdk";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 as Client } from "@aws-sdk/client-s3";
// https://itnext.io/wasabi-pros-cons-and-how-to-use-with-javascript-fa528c3779a2

const client = new Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: Bun.env.S3_KEY!,
    secretAccessKey: Bun.env.S3_SECRET!,
  },
  endpoint: {
    url: new URL("https://s3.wasabisys.com"),
    // url: new URL("https://s3.eu-central-2.wasabisys.com"),
  },
});

const S3 = {
  upload: async ({
    bucketName = Bun.env.S3_BUCKET!,
    key,
    body,
  }: {
    bucketName?: string;
    key: string;
    body: any;
  }) => {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
    };
    const options = {
      partSize: 10 * 1024 * 1024, // 10 MB
      queueSize: 10,
    };

    //TODO: https://stackoverflow.com/questions/70515370/how-to-upload-file-to-aws-s3-bucket-via-pre-signed-url-in-node-js
    return await new Upload({
      client,
      params,
      ...options,
    }).done();
  },
  list: async ({
    bucketName = Bun.env.S3_BUCKET!,
  }: {
    bucketName?: string;
  }) => {
    const params = {
      Bucket: bucketName,
    };

    return client.listObjects(params);
  },
};

export default S3;
