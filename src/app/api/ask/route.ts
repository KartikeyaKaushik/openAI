// src/app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import OpenAI from 'openai';
import { pool } from '@/lib/db';  // Ensure you have your database connection setup

const openaiApiKey = 'sk-proj-7RIc3gdXZHXti7SmixGdT3BlbkFJWKgnDEMa0krwULd0q1tb';
// const openaiClient = new openai.OpenAIApi(openaiApiKey);
const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    // Fetch data from external APIs
    const cities = await axios.get('https://sowtex.com/get-all-cities');
    const categories = await axios.get('https://sowtex.com/get-all-categories-app');
    const subCategories = await axios.get('https://sowtex.com/get-all-sub-cat');

    let cat = '';
    let city = '';
    let subCat = '';

    // Determine category from question
    for (let i = 0; i < categories.data.length; i++) {
      const item = categories.data[i].category.replace('-', ' ');
      const itemTrimmed = categories.data[i].category.slice(0, -1).replace('-', ' ');
      if (question.toLowerCase().includes(item.toLowerCase()) || question.toLowerCase().includes(itemTrimmed.toLowerCase())) {
        cat = item;
        break;
      }
    }

    // Determine city from question
    for (let i = 0; i < cities.data.length; i++) {
      const item = cities.data[i].name;
      const itemTrimmed = cities.data[i].name.slice(0, -1);
      if (question.toLowerCase().includes(item.toLowerCase()) || question.toLowerCase().includes(itemTrimmed.toLowerCase())) {
        city = item;
        break;
      }
    }

    // Determine sub-category from question
    for (let i = 0; i < subCategories.data.length; i++) {
      const item = subCategories.data[i].name;
      const itemTrimmed = subCategories.data[i].name.slice(0, -1);
      if (question.toLowerCase().includes(item.toLowerCase()) || question.toLowerCase().includes(itemTrimmed.toLowerCase())) {
        subCat = item;
        break;
      }
    }

    let hint = '';
    if (cat && city) {
      hint = `'${cat}' is the category and '${city}' is the city`;
    } else if (cat) {
      hint = `'${cat}' is the category`;
    } else if (city) {
      hint = `'${city}' is the city`;
    }
    if (subCat) {
      hint += ` and ${subCat} is the sub category`;
    }
    console.log(hint);
    const schema_description = `Tables:- xx_products: ( id int(11) NOT NULL,
      unique_id varchar(255) DEFAULT NULL,
      categoryId int(11) DEFAULT NULL,
      subCategoryId int(11) DEFAULT NULL,
      content varchar(10000) DEFAULT NULL,
      description varchar(5000) DEFAULT NULL,
      deleted enum('Y','N') DEFAULT 'N',
      orgId int(11) DEFAULT NULL,)- xx_category :(
      id int(11) NOT NULL,
      name varchar(500) DEFAULT NULL,
      )- xx_organisation (
      orgId int(11) NOT NULL,
      orgName varchar(255) DEFAULT '',
      countryId int(11) DEFAULT NULL,
      cityId int(11) DEFAULT NULL,
    )- xx_cities :(
      id int(11) NOT NULL,
      name varchar(30) NOT NULL,
    )- xx_sub_category : (
      categoryId int(11) DEFAULT NULL,
      subCategoryId int(11) NOT NULL,
      name varchar(100) DEFAULT NULL,
    )
    Relationships:- xx_sub_category.subCategoryId->xx_products.subCategoryId,
                    xx_products.categoryId -> xx_category.id,
                    xx_organisation.cityId->xx_cities.id,
                    xx_organisation.orgId->xx_products.orgId,
                    `;
    const prompt = (
      `Database schema ${schema_description}` +
      `${hint}` +
      `Use the prefix 'xx_' for all table names:\n` +
      `limit 1\n` +
      `if user is searching for products then select category name as Category, sub-category name as subCategory, unique_id as unique_id and orgName as orgName \n` +
      `don't use AND operator while building the query and products should be deleted="N"` +
      `Question: "${question}"\n` +
      `SQL Query:`
    );

    // Replace this with your actual OpenAI request code
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "generate mysql query " },
        { role: "user", content: prompt },
      ],
      temperature: 1,
    });

    const sqlQuery = openaiResponse.choices[0].message.content;

    // Execute the SQL query
    
    if (sqlQuery) {
      const [rows] = await pool.query(sqlQuery);
      return NextResponse.json(rows);
      // Process rows as needed
    }
    // console.log(rows);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
