/* ================================================================================

	database-update-send-email.
  
  Glitch example: https://glitch.com/edit/#!/notion-database-email-update
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/

================================================================================ */

const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const sendgridMail = require("@sendgrid/mail")

dotenv.config()
sendgridMail.setApiKey(process.env.SENDGRID_KEY)
const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID

//console.log("--------------", process.env, "\n----")
/**
 * Local map to store task pageId to its last status.
 * { [pageId: string]: string }
 */
const taskPageIdToStatusMap = {}
const newsPages = {}

/**
 * Initialize local data store.
 * Then poll for changes every 5 seconds (5000 milliseconds).
 */
setInitialTaskPageIdToStatusMap().then(() => {
  setInterval(findAndSendEmailsForUpdatedTasks, 5000)
})

/**
 * Get and set the initial data store with tasks currently in the database.
 */
async function setInitialTaskPageIdToStatusMap() {
console.log(">>NUM0")
  const currentTasks = await getTasksFromNotionDatabase()
  for (const { pageId, status } of currentTasks) {
    taskPageIdToStatusMap[pageId] = status
    newsPages[pageId] = "added"
    console.log("--pageid:", pageId)
  }
}

async function findAndSendEmailsForUpdatedTasks() {
console.log(">>NUM1")
  // Get the tasks currently in the database.
  console.log("\nFetching tasks from Notion DB...")
  const currentTasks = await getTasksFromNotionDatabase()

  // Return any tasks that have had their status updated.
  const updatedTasks = findUpdatedTasks(currentTasks)
  console.log(`Found ${updatedTasks.length} updated tasks.`)

  // For each updated task, update taskPageIdToStatusMap and send an email notification.
  for (const task of updatedTasks) {
    taskPageIdToStatusMap[task.pageId] = task.status
    newsPages[task.pageId] = "added"
    console.log("--pageid:", task.pageId)
    console.log(">>NUM1-sending email")
    pid = task.pageId
    await sendUpdateEmailWithSendgrid(task, pid)
  }
}

/**
 * Gets tasks from the database.
 *
 * @returns {Promise<Array<{ pageId: string, status: string, title: string }>>}
 */
async function getTasksFromNotionDatabase() {
console.log(">>NUM2")
  const pages = []
  let cursor = undefined
console.log("--------------------------------", databaseId)
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }
  console.log(`All ${pages.length} pages successfully fetched.`)

  const tasks = []
  for (const page of pages) {
    const pageId = page.id

    const statusPropertyId = page.properties["Status"].id
    const statusPropertyItem = await getPropertyValue({
      pageId,
      propertyId: statusPropertyId,
    })
    const status = statusPropertyItem.select
      ? statusPropertyItem.select.name
      : "No Status"

    const titlePropertyId = page.properties["Name"].id
    const titlePropertyItems = await getPropertyValue({
      pageId,
      propertyId: titlePropertyId,
    })
    const title = titlePropertyItems
      .map(propertyItem => propertyItem.title.plain_text)
      .join("")

    tasks.push({ pageId, status, title })
  }

  return tasks
}

/**
 * Compares task to most recent version of task stored in taskPageIdToStatusMap.
 * Returns any tasks that have a different status than their last version.
 *
 * @param {Array<{ pageId: string, status: string, title: string }>} currentTasks
 * @returns {Array<{ pageId: string, status: string, title: string }>}
 */
function findUpdatedTasks(currentTasks) {
  console.log(">>NUM3")
  //console.log("All tasks :", currentTasks)

  return currentTasks.filter(currentTask => {
    const previousStatus = getPreviousTaskStatus(currentTask)
    console.log("Current task is:", currentTask)
    //return currentTask.status == "new"
    return currentTask.status !== previousStatus
  })


  //#const response = await notion.pages.retrieve({ page_id: pageId });

}

/**
 * Sends task update notification using Sendgrid.
 *
 * @param {{ status: string, title: string }} task
 */
async function sendUpdateEmailWithSendgrid({ title, status }, pid) {
console.log(">>NUM4")
  const message = `Status of Notion task ("${title}") has been updated to "${status}".`
  console.log(message)
  console.log("======NEW email from", process.env.EMAIL_FROM_FIELD)
  console.log("======NEW email to", process.env.EMAIL_TO_FIELD)

  const blockId = pid
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });
  console.log("=== Got news page whole content:", response);


  try {
    // Send an email about this change.
    await sendgridMail.send({
      to: process.env.EMAIL_TO_FIELD,
      from: process.env.EMAIL_FROM_FIELD,
      subject: "Notion Task Status Updated",
      text: message,
    })
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Email Sent")
  } catch (error) {
    console.error("--1 in erorriii--:", typeof(error.response["body"]))
    console.error("--2 in erorriii--:", error.response["body"]["errors"])
  }
}

/**
 * Finds or creates task in local data store and returns its status.
 * @param {{ pageId: string; status: string }} task
 * @returns {string}
 */
function getPreviousTaskStatus({ pageId, status }) {
  console.log(">>NUM5")
  // If this task hasn't been seen before, add to local pageId to status map.
  if (!taskPageIdToStatusMap[pageId]) {
    taskPageIdToStatusMap[pageId] = status
  }
  return taskPageIdToStatusMap[pageId]
  //return news
}

/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 *
 * @param {{ pageId: string, propertyId: string }}
 * @returns {Promise<PropertyItemObject | Array<PropertyItemObject>>}
 */
async function getPropertyValue({ pageId, propertyId }) {
console.log(">>NUM6")
  const propertyItem = await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  })
  //console.log("Page item is:", propertyItem[propertyItem["type"]])
  if (propertyItem.object === "property_item") {
    return propertyItem
  }

  // Property is paginated.
  let nextCursor = propertyItem.next_cursor
  const results = propertyItem.results

  while (nextCursor !== null) {
    const propertyItem = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
      start_cursor: nextCursor,
    })

    nextCursor = propertyItem.next_cursor
    results.push(...propertyItem.results)
  }

  return results
}
