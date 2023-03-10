// This is a Notion API call to get data from particular database, by filers.

const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseID = process.env.NOTION_DATABASE_ID

async function getDatabaseItem() {
  console.log('1.>> Retrieving DB data:', databaseID);
  const response = await notion.databases.query({
    "database_id": databaseID,
    "sorts": [
      {
        "property": 'Date',
        "direction": 'ascending',
      },
    ],
  });
  console.log('1.>> Retrieved DB data is:', databaseID, response);
}


async function getPage() {
  pageId = '00000000000000000000000000000000'

  console.log('2.>> Retrieveing Page:', pageId);
  const response = await notion.pages.retrieve({ page_id: pageId });
  console.log('2.>> Retrieveing Page data is:', response);
}

getDatabaseItem()
//getPage()
