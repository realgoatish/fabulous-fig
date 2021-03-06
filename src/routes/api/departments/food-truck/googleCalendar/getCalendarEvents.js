import dotenv from 'dotenv'
dotenv.config()
import { createClientData } from './_createClientData'
import { queryGoogleCalendarApi } from '$lib/js/utils'

const { BASE_PATH } = process.env

export async function get() {

  let response

  try {

    response = await queryGoogleCalendarApi()

    .then(async res => {

      try {

        let entries = createClientData(res.data.items)

        for (let entry of entries) {
          // the fetch base URL needs to be changed to the production URL once this is deployed
          let menu = fetch(`${BASE_PATH}/api/menu/getMenuByTag/`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ tag: `${entry.summary.trim()}` })
          })

          entry.menu = await menu.then(data => data.json())

        }

        return entries

      } catch (e) {
        return {
          customErrorMessage: `Failed processing menu data for each event after Google Calendar API call in getCalendarEvents.js`
        }
      }
    })
  } catch (e) {
    return {
      customErrorMessage: `Failed during Google Calendar API call in getCalendarEvents.js`
    }
  }

  if (response.customErrorMessage) {
    return {
      status: 502,
      body: response
    }
  } 

  return {
    status: 200,
    headers: {
      'Cache-Control': 's-max-age=3600, stale-while-revalidate=3600',

    },
    body: response
  }
}