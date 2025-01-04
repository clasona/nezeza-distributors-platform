
import { v2 as cloudinary } from 'cloudinary';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse the JSON body of the request
    // const body = await req.json();
    const body = req.body as { paramsToSign: Record<string, string> };

    const { paramsToSign } = body;

    const CLOUDINARY_API_SECRET =
      process.env.CLOUDINARY_API_SECRET || undefined;

    if (!CLOUDINARY_API_SECRET) {
      return res
        .status(500)
        .json({ error: 'CLOUDINARY_API_SECRET is missing' });
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLOUDINARY_API_SECRET
    );

    return res.status(200).json({ signature });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to process the request' });
  }
}
