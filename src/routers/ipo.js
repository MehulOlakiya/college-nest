const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const { default: mongoose } = require('mongoose')
const axios = require('axios')
const {parseString} = require('xml2js');
const {Agent} = require("https");
const cheerio = require('cheerio');

router.get('/ipo-list', async (req, res) => {
    try {
        const response = await axios.post('https://linkintime.co.in/mipo/IPO.aspx/GetDetails', null, {
                headers: {
                    'accept': 'application/json, text/javascript, /; q=0.01',
                    'accept-language': 'en-US,en;q=0.9,gu;q=0.8',
                    'content-length': '0',
                    'content-type': 'application/json;charset:utf-8',
                },
            httpsAgent: new Agent({ rejectUnauthorized: false }),
        });
        let jsonData;
        parseString(response.data.d, { explicitArray: false }, (err, result) => {
            if (err) {
                throw err;
            }
            jsonData = result;
        });
        const dataArray = jsonData.NewDataSet.Table;

        // Handle the JSON data as needed
        // const $ = cheerio.load(response.data);
        //
        // // Extract relevant information based on HTML structure
        // const jsonData = {
        //     someKey: $('ddlClient'),
        //     anotherKey: $('ddlClient').attr('attribute-name'),
        //     // Add more properties as needed
        // };
        // console.log("dataa222222a :::: " , jsonData)
        // console.log("response  :::::::: >>>> " , response.data)

        // Handle the response as needed
        let result = []
        if(Array.isArray(dataArray)){
            result.push(...dataArray)
        }else{
            result.push(dataArray)
        }

        res.json(result);
    } catch (error) {
        // Handle errors
        console.error('Error making API call:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/search-on-pan', async (req, res) => {
    try {
const user = await User.findOne({ email:"solankimi2002@gmail.com" })
      const response = []
      const axiosCall = async(clientId,panNumber) => {

        const apiEndpoint = 'https://linkintime.co.in/mipo/IPO.aspx/SearchOnPan';
        const requestData = {
            // clientid: '11716',
            clientid:clientId,
            PAN: panNumber,
            key_word: 'PAN',
        };
        const response = await axios.post(apiEndpoint, requestData, {
            headers: {
                'accept': 'application/json, text/javascript, /; q=0.01',
                'accept-language': 'en-US,en;q=0.9,gu;q=0.8',
                'content-type': 'application/json; charset=UTF-8',
                'cookie': '_ga=GA1.3.332019997.1701188855; _ga_TH4DT3SZPV=GS1.1.1701188855.1.0.1701188861.0.0.0',
                'origin': 'https://linkintime.co.in',
                'referer': 'https://linkintime.co.in/mipo/ipoallotment.html',
                'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
            },
            httpsAgent: new Agent({ rejectUnauthorized: false }),
        });
        if(response){
            let jsonData;
            parseString(response.data.d, { explicitArray: false }, (err, result) => {
                if (err) {
                    throw err;
                }
                jsonData = result;
            });
            const dataArray = jsonData.NewDataSet.Table;
            return dataArray
        }
       
     }
     for (let i = 0; i < user.panCardDetails.length; i++) {
        const element = user.panCardDetails[i];

    const axiosResponse = await axiosCall(req.body.clientId, element.panNumber)
    let res;
      if(axiosResponse){
        if(Array.isArray(axiosResponse)){
            res = axiosResponse[0]
        }
        res = axiosResponse
        
        response.push({
            name:element.name,
            panNumber:element.panNumber,
            share:res['SHARES'],
            status:res['ALLOT'] == res['SHARES'] ? 'Yes':'No',
            category:res['PEMNDG']
        })
      }else{
        response.push({
            name:element.name,
            panNumber:element.panNumber,
            share:0,
            status:"Not Applied",
            category:""
          })
      }
     
     }
  

        // Handle the JSON data as needed
        // console.log("name",dataArray);
        // console.log("Allotment",dataArray.ALLOT);
        // Handle the response as needed
        res.json(response);

    } catch (error) {
        // Handle errors
        console.error('Error making API call:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/add-pan',async(req,res)=>{
    const user = await User.findOne({ email:req.body.email })
    if (!user) {
        return res.status(404).send("User not found")
    }
   try {
    user.panCardDetails = [...user.panCardDetails , ...req.body.panCardDetails]
    await user.save()
    res.send(user)
   } catch (error) {
    res.status(404).send(error)
   }
} )

module.exports = router