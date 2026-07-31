import { isValidObjectId } from "mongoose";

function checkId(req, res, next) {
  const { id } = req.params;

  // যদি এটি 24 ক্যারেক্টারের হেক্স স্ট্রিং না হয়, তাহলে এটি slug, পাস করে দিন
  const isObjectIdFormat = /^[0-9a-fA-F]{24}$/.test(id);

  if (!isObjectIdFormat) {
    // Slug হিসেবে বিবেচনা করে পরবর্তীতে পাঠান
    return next();
  }

  // ObjectId ফরম্যাটে কিন্তু ইনভ্যালিড হলে এরর
  if (!isValidObjectId(id)) {
    res.status(404);
    throw new Error(`Invalid ObjectId: ${id}`);
  }

  next();
}

export default checkId;
