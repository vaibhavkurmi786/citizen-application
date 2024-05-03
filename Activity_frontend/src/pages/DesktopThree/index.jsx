import React, { useEffect, useState } from "react";

import { Button, Img, List, Text } from "components";
import { API_URL } from "Constant";
// import { Card, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import Location from "pages/Location/Location";
import { useAuth } from "components/AuthProvider/AuthProvider";
import axios from "axios";

const Createpost = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { authenticated, setAuthenticated } = useAuth();
  const [userData, setUserData] = useState();
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [totalTime, setTotalTime] = useState(""); // Added state for total time
  // Use state to store form data
  const [formsData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    idCard: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [locationData, setLocationData] = useState({
    city: "",
    state: "",
  });
  const buttons = [
    { id: 1, label: "Gardening" },
    { id: 2, label: "Cleaning" },
    { id: 3, label: "Teaching Poor" },
    { id: 4, label: "Planting Tree" },
    { id: 5, label: "Marathon" },
    { id: 6, label: "Social Activities" },
  ];

  // Function to get and format the current date
  useEffect(() => {
    const getCurrentDate = () => {
      const dateObj = new Date();
      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString(
        "default",
        {
          month: "short",
        }
      )} ${dateObj.getFullYear()}`;
      setCurrentDate(formattedDate);
    };

    // Call the function when the component mounts
    getCurrentDate();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("Photo file", file.name);
  };

  const handleVideoChange = (e) => {
    const videoFile = e.target.files[0];
    setSelectedVideo(videoFile);
    console.log("Video file", videoFile.name);
  };

  const handleLocationChange = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (response.data && response.data.address) {
        const { city, state } = response.data.address;
        setLocationData({ city, state });

        // Update formData with latitude, longitude, city, and state
        setFormData((prevData) => ({
          ...prevData,
          latitude: latitude,
          longitude: longitude,
        }));
      } else {
        console.error("Error fetching location data");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const handleButtonClick = (label) => {
    setSelectedButton(label);
    setSelectedCategories(label);
  };

  useEffect(() => {
    // Check if both token and user key are present in local storage
    const token = localStorage.getItem("token");
    const userKey = localStorage.getItem("userKey");

    console.log("token", token)
    console.log("userkey", userKey)
    if (!token || !userKey) {
      // Redirect to the login page if either token or user key is missing
      navigate("/login");
    } else {
      // Fetch user data when component mounts
      // fetchUserData(token);
      setAuthenticated(true);
    }
  }, []); // Empty dependency array ensures that this effect runs only once on mount

  useEffect(() => {
    const fetchUserData = async (token) => {
      // console.log("kya token aa rha hia", token)
      try {
        const response = await fetch(`${API_URL}/activity/profile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log("kya response aya", response)
          // Check content type before parsing as JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const userData = await response.json();

            setUserData(userData); // Update user data in the state
          } else {
            console.error("Error fetching user data: Response is not JSON");
            // Handle non-JSON response accordingly
          }
        } else {
          console.error("Error fetching user data:", response.status);
          const errorData = await response.text(); // Get the entire response as text
          console.error("Error details:", errorData);
          // Handle the error accordingly
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (authenticated) {
      fetchUserData(localStorage.getItem("token"));
    }
  }, [authenticated]);

  // Fetch historical data and calculate total time
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("token is coming", token)
        if (!token) {
          navigate("/login");
          return;
        }

        if (!userData || !userData.userData) {
          // Handle case where userData is not yet loaded
          return;
        }

        const response = await fetch(
          `${API_URL}/activity/AllDetails/${userData.userData.id}`, // Replace with your actual API endpoint
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const historicalData = await response.json();

          if (Array.isArray(historicalData) && historicalData.length > 0) {
            // Calculate total hours from all historical data
            const totalHours = calculateTotalHours(historicalData);
            setTotalTime(totalHours);
          }
        } else {
          console.error("Error fetching historical data:", response.status);
          // Handle error accordingly
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [userData]);

  // Utility function to calculate total hours from historical data
  const calculateTotalHours = (historicalData) => {
    let totalHours = 0;

    historicalData.forEach((data) => {
      if (data.totalTime) {
        const [hours, minutes, seconds] = data.totalTime.split(":");
        totalHours += parseInt(hours) + parseInt(minutes) / 60;
      }
    });

    return totalHours.toFixed(2); // Limit to two decimal places
  };

  const handleLogout = () => {
    // Clear authentication status, remove token and user key, and redirect to the login page
    setAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userKey");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object
    const formsDATA = new FormData();
    console.log(formsDATA);
    formsDATA.append("selectedCategories", selectedCategories);
    formsDATA.append("date", currentDate);
    formsDATA.append("photo", selectedFile);
    formsDATA.append("video", selectedVideo);
    formsDATA.append("fromTime", fromTime); // Add fromTime
    formsDATA.append("toTime", toTime); // Add toTime
    formsDATA.append("userId", userData && userData.userData.id);
    // Append latitude and longitude to formData
    formsDATA.append("latitude", formsData.latitude);
    formsDATA.append("longitude", formsData.longitude);

    console.log(formsDATA.get("name"));
    console.log("formData", formsDATA);

    const formDataJson = {};
    for (const [key, value] of formsDATA.entries()) {
      formDataJson[key] = value;
    }

    console.log("form data", formDataJson);

    try {
      const response = await fetch(`${API_URL}/activity/CreateActivity`, {
        method: "POST",
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        body: formsDATA,
        // body:formsDATA.stringify()
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        navigate("/activity");
      } else {
        console.error("Error:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const direct = () => {
    navigate("/activity");
  };

  return (
    <>
      {authenticated && (
        <form className="w-screen h-screen  flex items-center justify-center pt-5 pb-5 sm:w-screen sm:h-screen md:pt-5 md:pb-5" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="hidden">
            <Location onLocationChange={handleLocationChange} />
          </div>

          <div className="w-1/4 h-full sm:w-screen sm:h-screen md:w-2/4 md:h-screen  lg:w-3/4 lg:h-screen  flex flex-col items-center justify-center  shadow-bs2 shadow-black-900 sm:shadow-blue-300 md:pl-8 md:pr-8 md:pt-2 ">
            <div className=" flex flex-col gap-2 items-center justify-start w-full h-full ">
              <div className="bg-gray-50 flex flex-row items-center justify-between p-5  sm:px-5 w-full rounded-xl">
                <div className="flex flex-row gap-4 items-center justify-center ml-[5px]">
                  {userData && (
                    <Img
                      className=" sm:w-[68px] sm:h-[58px] md:w-[68px] md:h-[58px] lg:w-[68px] lg:h-[58px]  w-[68px] h-[68px] rounded-full object-cover object-top "
                      src={`${API_URL}/image/${userData.userData.photo}`}
                      alt="userimage"
                    />
                  )}
                  <div className="flex flex-col items-center justify-center w-3/5">
                    <div className="flex flex-col items-start justify-center w-full">
                      <Text
                        className="text-center text-gray-900 uppercase"
                        size="txtInterSemiBold16Gray900"
                      >
                        {userData && userData.userData.name}
                      </Text>
                      {/* <Text className="text-center  text-gray-900 uppercase text-sm">
                        ID: {userData && userData.userData.id}
                      </Text> */}
                    </div>
                  </div>
                </div>
                <Button
                  className="font-semibold btn-11"
                  shape="round"
                  color="indigo_A200"
                  onClick={direct}
                >
                  {`${totalTime || "0"} hours`}
                </Button>
              </div>
              <div className="glow-border bg-gray-50 w-full h-15 text-center border-2 border-dashed border-zinc-300 rounded-xl">
                <h1 className="text-xl  font-semibold">Add New Activity</h1>
              </div>

              <div className=" relative p-5 flex items-center justify-center gap-4 w-full ">
                Time Spent:{" "}
                <label
                  htmlFor="fromTime"
                  className="text-xs absolute top-0 left-13 ml-2 mt-1 text-gray-500"
                >
                  From
                </label>
                <input
                  type="time"
                  name="fromTime"
                  id="fromTime"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="rounded-lg border-2 border-dashed text-xs"
                />{" "}
                <label
                  htmlFor="fromTime"
                  className="text-xs absolute top-0 right-8 ml-2 mt-1 text-gray-500"
                >
                  To
                </label>
                <input
                  type="time"
                  name="toTime"
                  id="toTime"
                  value={toTime}
                  placeholder="To time"
                  onChange={(e) => setToTime(e.target.value)}
                  className="rounded-lg border-2 border-dashed text-xs"
                />
              </div>
              <div className="flex flex-col items-start justify-center w-[100%] sm:w-full">
                <Text
                  className="text-base text-gray-900"
                  size="txtInterSemiBold16Gray900"
                >
                  Select Category
                </Text>
                <div className="flex flex-wrap  items-center justify-between mt-[18px] w-full">
                  {buttons.map((button) => (
                    <label
                      key={button.id}
                      className={`flex flex-wrap rounded-[20px] items-center justify-center border-2 overflow-hidden border-double border-white p-4 m-1 w-34 cursor-pointer ${
                        selectedButton === button.label
                          ? "border-orange-400"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="radioButtons"
                        className="hidden"
                        onClick={() => handleButtonClick(button.label)}
                      />
                      <span className="font-semibold">{button.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-row gap-2.5 items-center justify-between mt-[30px] w-full">
                  <Button
                    className="cursor-pointer flex items-center justify-center min-w-[145px]"
                    leftIcon={
                      <div className="mb-[3px] mr-[9px] h-4 w-4 ">
                        <Img
                          src="images/img_location.svg"
                          alt="location icon"
                        />
                      </div>
                    }
                    shape="round"
                    color="blue_50"
                  >
                    <div className="font-medium leading-[normal] text-[15px] text-left ">
                      {locationData.city}, {locationData.state}
                    </div>
                  </Button>
                  <Button
                    className="cursor-pointer flex items-center justify-center min-w-[150px]"
                    type="none"
                    leftIcon={
                      <div className="h-4 mb-[3px] mr-2.5 w-4">
                        <Img
                          className="h-4"
                          src="images/img_calendar.svg"
                          alt="calendar"
                        />
                      </div>
                    }
                    shape="round"
                    color="blue_50"
                  >
                    <div className="font-medium leading-[normal] text-[15px] text-left">
                      {currentDate}
                    </div>
                  </Button>
                </div>
                <List className="flex-col  justify-center mt-2 w-full">
                  <div className="flex flex-1 flex-col gap-[9px] mb-2 items-start justify-start w-full">
                    <Text
                      className="text-base text-gray-900"
                      size="txtInterSemiBold16Gray900"
                    >
                      Photos
                    </Text>
                    <div className="bg-gray-50_01 border border-dashed border-indigo-500 flex flex-col items-center justify-end p-2 rounded-[5px] shadow-bs1 w-full">
                      <div className="flex flex-row gap-2.5 items-start justify-center mt-0.5 w-[44%] sm:w-full">
                        <Text
                          className="text-[13px] text-indigo-A200"
                          size="txtInterMedium13"
                        >
                          {" "}
                          <input
                            className="bg-gray-50_01  flex flex-col items-center justify-end p-2 rounded-[5px] shadow-bs1 w-full"
                            name="file"
                            type="file"
                            id="photo"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                          />
                          {/* Upload */}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 items-start justify-start w-full">
                    <Text
                      className="text-base text-gray-900"
                      size="txtInterSemiBold16Gray900"
                    >
                      Videos
                    </Text>
                    <div className="bg-gray-50_01 border border-dashed border-indigo-500 flex flex-col items-center justify-end p-2 rounded-[5px] shadow-bs1 w-full">
                      <div className="flex flex-row gap-2.5 items-start justify-center mt-0.5 w-[44%] sm:w-full">
                        {/* <Img
                          className="h-3 w-3"
                          src="images/img_twitter.svg"
                          alt="twitter"
                        /> */}

                        <Text
                          className="text-[13px] text-indigo-A200"
                          size="txtInterMedium13"
                        >
                          <input
                            className="bg-gray-50_01  flex flex-col items-center justify-end p-2 rounded-[5px] shadow-bs1 w-full"
                            type="file"
                            id="video"
                            accept="video/*"
                            multiple
                            onChange={handleVideoChange}
                          />
                          {/* Upload */}
                        </Text>
                      </div>
                    </div>
                  </div>
                </List>
                {/* <Text
                    className="mt-[27px] text-base text-gray-900"
                    size="txtInterSemiBold16Gray900"
                  >
                    Add Hours Spent
                  </Text> */}
                <Button
                  className="cursor-pointer font-semibold w-full mt-5 mb-1 text-base text-center"
                  shape="round"
                  color="indigo_A200"
                >
                  SUBMIT
                </Button>
              </div>
            {/* </div> */}
            <Button
              className="cursor-pointer font-semibold w-full  text-base text-center"
              shape="round"
              color="indigo_A200"
              onClick={handleLogout} // Add logout functionality
            >
              LOGOUT
            </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default Createpost;
