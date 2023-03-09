// This is a Notion API call to get data from particular database, by filers.

const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseID = process.env.NOTION_DATABASE_ID

async function getDatabaseItem() {
  const response = await notion.databases.query({
    database_id: databaseID,
    filter: {
      and: [
        {
          property: 'Content',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Number',
          number: {
            greater_than_or_equal_to: 2,
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Created Date',
        direction: 'ascending',
      },
    ],
  });
  console.log(response);
}

getDatabaseItem()
