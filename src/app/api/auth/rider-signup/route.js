import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const phone = formData.get("phone");
    const vehicleType = formData.get("vehicleType") || "";
    const licensePlate = formData.get("licensePlate") || "";
    const street = formData.get("street") || "";
    const city = formData.get("city") || "";
    const state = formData.get("state") || "";
    const zipCode = formData.get("zipCode") || "";
    const country = formData.get("country") || "";
    const profileImage = formData.get("profileImage");

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Name, email, password, and phone are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    let profileImageUrl = "";

    if (profileImage && profileImage.size > 0) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "safecom/riders",
              transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      profileImageUrl = result.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageUrl,
      phone,
      role: "delivery",
      vehicleType,
      licensePlate,
      address: { street, city, state, zipCode, country },
    });

    return NextResponse.json(
      {
        message: "Rider account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rider signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
