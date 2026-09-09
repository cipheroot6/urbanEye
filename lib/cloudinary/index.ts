import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadCrop(base64: string, busId: string): Promise<string> {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64}`,
    {
      folder: `urbaneye/${busId}`,
      resource_type: "image",
    }
  )
  return result.secure_url
}
