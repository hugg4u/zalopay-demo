/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import CryptoJS from "crypto-js";
import qs from "qs";
import {configZLP} from "../config";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {    
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }
  try {
    const appTransId = req.body.appTransId;

    const postData = {
      app_id: configZLP.app_id,
      app_trans_id: appTransId,
      mac: '' 
    }

    const data = [postData.app_id, postData.app_trans_id, configZLP.key1].join("|");
    postData.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();


    const postConfig = {
      method: 'post',
      url: configZLP.endpoint + 'query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(postData)
    };

    axios(postConfig)
    .then(function (response) {
      res.status(200).json(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  } catch (err: any) {
    res.status(500).json({statusCode: 500, message: err.message});
  }
}