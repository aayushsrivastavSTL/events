"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { useCookies } from "react-cookie";
import { ImSpinner2 } from "react-icons/im";

const CheckpointSelectionPage = () => {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [accessCookie, setAccessCookie, removeAccessCookie] = useCookies([
    "accessToken",
  ]);
  const currentCheckpoint = JSON.parse(localStorage.getItem("checkpoint"));

  console.log("currentCheckpoint", currentCheckpoint);
  useEffect(() => {
    const fetchCheckpointsName = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = accessCookie.accessToken;
        if (!token) {
          router.push("/");
          return;
        }

        const encodedPath = encodeURIComponent(
          "volunteer/get-checkin-points-name"
        );
        const res = await fetch(`/api/proxy?path=${encodedPath}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch checkpoints");
        }

        const data = await res.json();
        console.log("fetchCheckpointsName", data);

        if (data?.data) {
          setCheckpoints(data.data);

          if (currentCheckpoint) {
            setSelectedCheckpoint(
              data.data.find(
                (checkpoint) => checkpoint.id === currentCheckpoint.id
              )
            );
          }
        } else {
          throw new Error(data.message || "No checkpoints available");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckpointsName();
  }, []);

  const handleSelectCheckpoint = async (checkpoint) => {
    if (updating) return;
    try {
      setUpdating(true);

      //store checkpoint in localstorage
      localStorage.setItem("checkpoint", JSON.stringify(checkpoint));

      // Update selected checkpoint
      setSelectedCheckpoint(checkpoint);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-15 p-6">
        <div className="flex items-center justify-center py-24">
          <ImSpinner2 className="animate-spin text-3xl text-orange-500" />
        </div>
      </div>
    );
  }
  console.log("checkpoints", checkpoints);
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 mt-15">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FaMapMarkerAlt className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Select Checkpoint
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Choose the checkpoint where you'll be scanning QR codes
            </p>

            {/* Current checkpoint info */}
            {currentCheckpoint && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Current: </span>
                  {currentCheckpoint.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Checkpoints List */}
        <div className="space-y-3">
          {checkpoints.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaMapMarkerAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No checkpoints available</p>
              <p className="text-sm text-gray-400 mt-1">
                Please contact your administrator
              </p>
            </div>
          ) : (
            checkpoints.map((checkpoint) => {
              const isSelected = selectedCheckpoint?.id === checkpoint.id;

              return (
                <button
                  key={checkpoint.id}
                  onClick={() => handleSelectCheckpoint(checkpoint)}
                  disabled={updating}
                  className={`w-full text-left transition-all duration-200 ${
                    updating
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                  }`}
                >
                  <div
                    className={`bg-white rounded-xl shadow-md p-5 sm:p-6 border-2 ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Checkpoint Name */}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          {checkpoint.name}
                        </h3>

                        {/* Checkpoint Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Event:</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold">
                              {checkpoint.event_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-orange-500 border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <FaCheck className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Update button for selected checkpoint */}
        {selectedCheckpoint && checkpoints.length > 0 && (
          <div className="mt-8 rounded-xl shadow-lg">
            <button
              onClick={() => router.push("/scan")}
              disabled={updating}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <ImSpinner2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Continue to Scan</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointSelectionPage;
