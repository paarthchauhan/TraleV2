import React, { useEffect, useState } from "react";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
  AIPromptModal,
} from "../components";
import { Link } from "react-router-dom";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  apiRequest,
  deletePost,
  fetchPosts,
  getUserInfo,
  handleFileUpload,
  likePost,
  sendFriendRequest,
} from "../utils";
import { useForm } from "react-hook-form";
import { NoProfile } from "../assets";
import { UserLogin } from "../redux/userSlice";
import { GoogleGenerativeAI } from "@google/generative-ai";


const Home = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const dispatch = useDispatch();
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [showAIPostModal, setShowAIPostModal] = useState(false); // State to control AI Post modal visibility
  const [aiPostContent, setAiPostContent] = useState(null);
  const [description, setDescription] = useState("");

  const fetchPost = async () => {
    await fetchPosts(user.token, dispatch);
    setLoading(false);
  };

  const onSubmitPost = async (data) => {
    setPosting(true);
    setErrMsg("");
    try {
      let uri = null;
      if (file) {
        uri = await handleFileUpload(file);
      }
      
      const newData = uri ? { ...data, image: uri } : data;

      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST",
      });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        console.log("Response from create-post:", res);
        reset({
          description: "",
        });
        setFile(null);
        setImagePreview(null);
        setErrMsg("");
        await fetchPost();
      }
      setPosting(false);
    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  };

  useEffect(() => {
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }, [file]);

  const handleLikePost = async (uri) => {
    await likePost({ uri: uri, token: user?.token });

    await fetchPost();
  };

  const handleDelete = async (id) => {
    await deletePost(id, user.token);
    await fetchPost();
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = { token: user?.token, ...res };
    dispatch(UserLogin(newData));
  };

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriends();
  }, []);
  

  const fileToImagePart = async (file) => {
    const mimeType = file.type;
  
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result.split(",")[1]; // remove data:mime;base64,
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  
    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  };
  
  const handleCreateWithAI = async (file) => {
    try {
      console.log("🖼️ File received for AI:", file); // Directly a File object
  
      const ai = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const imagePart = await fileToImagePart(file);
      console.log("📸 imagePart:", imagePart);
      const prompt = `Generate a single, short, friendly, and engaging social media caption for the uploaded image.
        It should sound natural and fun, be under 280 characters, and include relevant hashtags.
        Do NOT provide multiple options or label anything — just return one caption string only.
        `;

      const promptInput = [
        prompt,
        imagePart,
      ];
  
      const result = await model.generateContent(promptInput);
  
      const generatedText = await result.response.text();
      console.log("🧠 Generated caption:", generatedText);
  
      setAiPostContent({ text: generatedText });
      setDescription(generatedText);
      reset({ description: generatedText });
      setShowAIPostModal(false);
    } catch (err) {
      console.error("🔥 AI caption error:", err);
    }
  };
  
  return (
    <>
      <div className='w-full px-0 lg:px-10 pb-5 md:pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />
        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
          {/* LEFT */}
          <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto md:pl-4 lg:pl-0'>
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className=' flex-1 h-full bg-orimary px-4 flex flex-col gap-6 overflow-y-auto'>
          <form
            className='bg-primary px-4 rounded-lg'
            onSubmit={handleSubmit(onSubmitPost)}
          >
            <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
              <img
                src={user?.profileUrl ?? NoProfile}
                alt='User Image'
                className='w-14 h-14 rounded-full object-cover'
              />

              <TextInput
                styles='w-full rounded-full py-5'
                placeholder="What's on your mind...."
                name='description'
                value={description} // Add this
                onChange={(e) => setDescription(e.target.value)} // Add this
                register={register("description", {
                  required: "Write something about post",
                  value: description, // Add this to sync with react-hook-form
                })}
                error={errors.description ? errors.description.message : ""}
              />
            </div>
            {errMsg?.message && (
              <span
                role='alert'
                className={`text-sm ${
                  errMsg?.status === "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                } mt-0.5`}
              >
                {errMsg?.message}
              </span>
            )}

            <div className='flex items-center justify-between py-4'>
              <label
                className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
                htmlFor='imgUpload'
              >
                <input
                  type='file'
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                  className='hidden'
                  id='imgUpload'
                  data-max-size='5120'
                  accept='.jpg, .png, .jpeg'
                />
                <BiImages />
                <span>Image</span>
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-md"
                />
              )}

                  <CustomButton
                    onClick={() => setShowAIPostModal(true)} // Show AI modal
                    title='Create with AI'
                    containerStyles='bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm'
                  />

                {posting ? (
                  <Loading />
                ) : (
                  <CustomButton
                    type='submit'
                    title='Post'
                    containerStyles='bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm'
                  />
                )}
              </div>
            </form>

            {showAIPostModal && (
              <AIPromptModal
                onClose={() => setShowAIPostModal(false)}
                onGenerate={handleCreateWithAI}
                file={file}
                imagePreview={imagePreview}
              />
            )}


            <div className='block md:hidden'>
              <ProfileCard user={user} />
            </div>
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  post={post}
                  key={post?._id}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className='flex w-full h-full items-center justify-center'>
                <p className='text-lg text-ascent-2'>No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
            {/* FRIEND REEQUESTS */}
            <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span> Friend Request</span>
                <span>{friendRequest?.length}</span>
              </div>
              <div className='w-full flex flex-col gap-4 pt-4'>
                {friendRequest?.map(({ _id, requestFrom: from }, index) => (
                  <div
                    className='flex items-center justify-between'
                    key={index + _id}
                  >
                    <Link
                      to={"/profile/" + from._id}
                      key={from?._id}
                      className='w-full flex gap-4 items-center cursor-pointer'
                    >
                      <img
                        src={from?.profileUrl ?? NoProfile}
                        alt={from?.firstName}
                        className='w-10 h-10 object-cover rounded-full'
                      />
                      <div className='flex-1 '>
                        <p className='text-base font-medium text-ascent-1'>
                          {from?.firstName} {from?.lastName}
                        </p>
                        <span className='text-sm text-ascent-2'>
                          {from?.profession ?? "No Profession"}
                        </span>
                      </div>
                    </Link>

                    <div className='flex gap-1'>
                      <CustomButton
                        onClick={() => acceptFriendRequest(_id, "Accepted")}
                        title='Accept'
                        containerStyles='bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full'
                      />
                      <CustomButton
                        title='Deny'
                        onClick={() => acceptFriendRequest(_id, "Denied")}
                        containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED FRIENDS */}
            <div className='w-full bg-primary shadow-xl rounded-lg px-6 py-5'>
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Friend Suggestion</span>
              </div>
              <div className='w-full flex flex-col gap-4 pt-4'>
                {suggestedFriends?.map((friend, index) => (
                  <div
                    className='flex items-center justify-between'
                    key={index + friend?._id}
                  >
                    <Link
                      to={"/profile/" + friend?._id}
                      key={friend?._id}
                      className='w-full flex gap-4 items-center cursor-pointer'
                    >
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className='w-10 h-10 object-cover rounded-full'
                      />
                      <div className='flex-1 '>
                        <p className='text-base font-medium text-ascent-1'>
                          {friend?.firstName} {friend?.lastName}
                        </p>
                        <span className='text-sm text-ascent-2'>
                          {friend?.profession ?? "No Profession"}
                        </span>
                      </div>
                    </Link>

                    <div className='flex gap-1'>
                      <button
                        className='bg-[#0444a430] text-sm text-white p-1 rounded'
                        onClick={() => handleFriendRequest(friend?._id)}
                      >
                        <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
