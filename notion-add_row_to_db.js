const { Client, APIErrorCode } = require("@notionhq/client")

const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseID = process.env.NOTION_DATABASE_ID

function get_DateTime() {
  let ts = Date.now();
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let hrs = date_ob.getHours();
  let min = date_ob.getMinutes();
  let sec = date_ob.getSeconds();
  dt = year + "-" + month + "-" + date + "_" + hrs  + ":" + min + ":" + sec
  console.log(dt)
  return dt 
}

async function addItem(text) {
  let ts = get_DateTime()
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseID },
      properties: {
        title: { 
          title:[
            {
              "text": {
                "content": text + ts
              }
            }
          ]
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}

textStr = "New item: "
addItem(textStr)
