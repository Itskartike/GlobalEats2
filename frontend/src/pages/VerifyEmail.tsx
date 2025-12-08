import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      toast.error("Invalid verification link");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        if (data?.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          toast.success("Email verified successfully");
          setTimeout(() => navigate("/profile"), 2500);
        } else {
          setStatus("error");
          setMessage(data?.message || "Failed to verify email.");
          toast.error(data?.message || "Failed to verify email");
        }
      } catch (err: any) {
        setStatus("error");
        const apiMessage = err?.response?.data?.message;
        setMessage(apiMessage || "Verification link is invalid or expired.");
        toast.error(apiMessage || "Verification failed");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4 p-8 text-center">
        <div className="flex justify-center mb-4">
          {status === "success" ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : status === "error" ? (
            <XCircle className="w-16 h-16 text-red-500" />
          ) : (
            <Mail className="w-16 h-16 text-orange-500 animate-pulse" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
        <p className="text-gray-600 mb-6">
          {status === "loading" && "Verifying your email..."}
          {status !== "loading" && message}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/")} variant="outline" className="w-1/2">
            Home
          </Button>
          <Button onClick={() => navigate("/profile")} className="w-1/2">
            Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;


