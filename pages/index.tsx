import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from 'qrcode.react';

export default function Home() {
  const [qrCode, setQrCode] = useState<string | undefined>(undefined);
  const [appTransId, setAppTransId] = useState<string | undefined>(undefined);
  const [secondsToGo, setSecondsToGo] = useState<number>(600);
  const [amount, setAmount] = useState<string>("");

  // Hàm tạo đơn hàng
  const createOrder = async () => {
    try {
      const res = await axios.post("/api/create_order", { amount });
      setQrCode(res.data.url);
      setAppTransId(res.data.appTransID);
      setSecondsToGo(60); // Reset countdown
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      if (secondsToGo > 0) {
        setSecondsToGo((prev) => prev - 1);
      }
      if (secondsToGo === 0) {
        clearInterval(timer);
        setAppTransId(undefined);
        setQrCode(undefined);
        setAmount('');
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsToGo]);

  // Kiểm tra trạng thái thanh toán
  useEffect(() => {
    if (!appTransId) return;

    const checkPaymentStatus = setInterval(async () => {
      try {
        const res = await axios.post("/api/query_status", {
          appTransId,
        });
        const returnCode = res.data.return_code;
        if (returnCode === 1) {
          clearInterval(checkPaymentStatus);
          // Xử lí nếu thanh toán thành công
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 1000);

    return () => {
      clearInterval(checkPaymentStatus);
    };
  }, [appTransId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-500">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">ZaloPay Payment</h1>
        <div className="flex justify-center mb-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border text-black border-gray-300 rounded-lg p-2 w-full"
          />
          <button
            className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-600"
            onClick={createOrder}
          >
            Pay
          </button>
        </div>

        {qrCode && secondsToGo > 0 && (
          <div className="text-center flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold mb-2 text-black">Waiting for payment...</h2>
            <p className="text-gray-600 mb-4">
              Time left to scan QR code: <span className="font-bold">{secondsToGo}</span> seconds
            </p>
            <h3 className="text-md font-medium mb-2 text-black">Scan the QR code below:</h3>
            <QRCodeCanvas value={qrCode} size={200} />
          </div>
        )}
      </div>
    </div>
  );
}
