/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from "crypto-js";
import {configZLP} from "../config";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {    
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }
  try {
    const result: {
      return_code: number;
      return_message: string;
    } = {
      return_code: 0,
      return_message: '',
    };
    
    try {
      const dataStr = req.body.data;
      const reqMac = req.body.mac;

      const mac = CryptoJS.HmacSHA256(dataStr, configZLP.key2).toString();

      if (reqMac !== mac) {
        // invalid callback
        result.return_code = -1;
        result.return_message = "mac is not equal";
      } else {
        // the payment is successful
        console.log(`💰  Payment Callback received!`);

        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex: any) {
      result.return_code = 0; 
      result.return_message = ex.message;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({statusCode: 500, message: err.message});
  }
} 
