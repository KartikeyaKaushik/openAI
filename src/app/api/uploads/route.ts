import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { NextResponse } from "next/server";
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import OpenAI from 'openai';
import { pool } from '@/lib/db';
const openaiApiKey = 'sk-proj-7RIc3gdXZHXti7SmixGdT3BlbkFJWKgnDEMa0krwULd0q1tb';
// const openaiClient = new openai.OpenAIApi(openaiApiKey);
const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

// Middleware to run multer
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  }
  
  // Disable body parsing for the API route
  // export const config = {
  //   api: {
  //     bodyParser: false,
  //   },
  // };


export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    
  try {
    type imageResponse = {
      value: string;
    }
    const body = await req.json();
    console.log(body); 

    const remoteFilePath = `https://sowtex.com/assets/images/openAI/${body.fileName}.jpg`;
    const imageResponse = await getOpenAIResponse(remoteFilePath);

    return NextResponse.json({
        message: 'File uploaded!',
        filePath: remoteFilePath,
        response: imageResponse,
      }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to process request', error: error.message }, { status: 500 });
  }
};

async function getOpenAIResponse(imageUrl: string) {
  // ... Your OpenAI handling code ...
    console.log('api hitted');
    // console.log('sldkjf');return false;
  const responseOpenAI = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'This image is related to textile can you tell me its category and sub category' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ],
      },
    ],
  });

  const keywords = ['lycra', 'spedix', 'polyester', 'cotton', 'nylon', 'wool', 'silk', 'linen', 'rayon', 'viscose', 'denim', 'fleece', 'velvet', 'twill', 'knitwear'];
  const categories = await axios.get('https://sowtex.com/get-all-categories-app');
  const subCategories = await axios.get('https://sowtex.com/get-all-sub-cat');

  const imageResponse = responseOpenAI.choices[0].message.content;
  let cat = '';
  let subCat = '';

  categories.data.forEach((item: { category: string }) => {
    const itemName = item.category.replace('-', ' ');
    const itemTrimmed = item.category.slice(0, -1).replace('-', ' ');
    if (imageResponse.toLowerCase().includes(itemName.toLowerCase()) || imageResponse.toLowerCase().includes(itemTrimmed.toLowerCase())) {
      cat = itemName;
    }
  });

  if (!cat) {
    subCategories.data.forEach((item: { name: string }) => {
      const itemName = item.name;
      const itemTrimmed = item.name.slice(0, -1);
      if (imageResponse.toLowerCase().includes(itemName) || imageResponse.toLowerCase().includes(itemTrimmed)) {
        subCat = itemName;
      }
    });
  }

  let hint = '';
  if (cat) {
    hint = `${cat} is the category, `;
  }
  if (subCat) {
    hint += `${subCat} is the sub_category, `;
  }
  if (!hint) {
    keywords.forEach((key) => {
      if (imageResponse.toLowerCase().includes(key)) {
        hint += `${key}, `;
      }
    });
    hint += ' use these as subcategories using OR operator and like operator';
  }

  const schema_description = `
    Tables:
    - xx_products: (id int(11) NOT NULL, unique_id varchar(255) DEFAULT NULL, categoryId int(11) DEFAULT NULL, subCategoryId int(11) DEFAULT NULL, content varchar(10000) DEFAULT NULL, description varchar(5000) DEFAULT NULL, deleted enum('Y','N') DEFAULT 'N', orgId int(11) DEFAULT NULL)
    - xx_category: (id int(11) NOT NULL, name varchar(500) DEFAULT NULL)
    - xx_organisation: (orgId int(11) NOT NULL, orgName varchar(255) DEFAULT '', countryId int(11) DEFAULT NULL, cityId int(11) DEFAULT NULL)
    - xx_cities: (id int(11) NOT NULL, name varchar(30) NOT NULL)
    - xx_sub_category: (categoryId int(11) DEFAULT NULL, subCategoryId int(11) NOT NULL, name varchar(100) DEFAULT NULL)
    Relationships:
    - xx_sub_category.subCategoryId -> xx_products.subCategoryId
    - xx_products.categoryId -> xx_category.id
    - xx_organisation.cityId -> xx_cities.id
    - xx_organisation.orgId -> xx_products.orgId
  `;

  const prompt = `
    Database schema ${schema_description}
    Use the prefix 'xx_' for all table names:
    limit 4
    if user is searching for products then select category name as Category, sub-category name as subCategory, unique_id as unique_id and orgName as orgName
    don't use AND operator while building the query and products should be deleted="N"
    Question: "${hint}"
    SQL Query:
  `;

  const openaiResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'generate mysql query ' },
      { role: 'user', content: prompt },
    ],
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const sqlQuery = openaiResponse.choices[0].message.content;
  const [rows] = await pool.query(sqlQuery);

  return { rows, res: imageResponse };
}


// export default apiRoute;
