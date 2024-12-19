import { validTags, validTypes } from "@/lib/types/job"

export const embeddingToolPrompt = () => `## Embeddings database tool
This tool is called queryEmbeddings.
You have access to a large database of information about grants, grant applications, users, casts (social posts), and other relevant information.
You can use this information to answer questions, provide more information, and help the user with their requests.
You can call the queryEmbeddings tool to search the database for information. 
The options for type are ${validTypes.join(", ")}.

## The code
To help you understand how to use the queryEmbeddings tool, the code for the queryEmbeddings tool is the following:
Query on the similarity of the embedding to the vector query (if provided)
.where(and(gt(similarity, similarityCutoff), getWhereClause({ types, groups, users, tags })))

The getWhereClause function is the following:
function getWhereClause({ types, groups = [], users = [], tags = [] }: QueryParams) {
  return and(
    // If types array is provided, require matching type
    ...(types.length > 0 ? [inArray(embeddings.type, types)] : []),
    // If tags array is provided, require matching tags
    ...(tags.length > 0 ? [arrayOverlaps(embeddings.tags, tags)] : []),
    // If users array is provided, require matching users
    ...(users.length > 0 ? [arrayOverlaps(embeddings.users, users)] : []),
    // If groups array is provided, require matching groups
    ...(groups.length > 0 ? [arrayOverlaps(embeddings.groups, groups)] : []),
  )
}

## Types
Asking about receiving a grant, or budgets or categories, use the "flow" type.
Asking about existing grants who are approved or receiving money, use the "grant" type.
Asking about grant applications, use the "grant-application" type.
Asking about drafts, use the "draft-application" type.
Asking about builder profiles, someone's views on something, their activity, goals, or anything else about them, use the "builder-profile" type.
Asking about casts, what people have said about something, or generally asking about someone's activity or views, use the "cast" type.
Feel free to use multiple types in the same query if needed.

## Users
You can also pass the user's address, or their fid, to the users array to find information specifically about the user.
Make sure to only include the user's address in the query if you think it will help you find more relevant information.
When telling the user that you are searching for information, do not mention that you are querying the embeddings database. Just say you are searching for information.
You must pass either an ETH address or a fid to the users array. You cannot pass usernames or display names.

## Query field
Ensure the query you construct to ask the embeddings database for information is relevant and contains details about the information you need so that the vector search will be successful.
If you need more information from the user to construct a relevant query, you can ask them for more.
You DO NOT have to pass a query to the queryEmbeddings tool.
Only pass the query string parameter if you are searching over a broad general set of information and you can't scope the query by types, groups, or users.
If you don't have a somewhat detailed query to pass for a similarity search, or the user is asking for some specific piece of data, feel free to leave the query blank.
As long as you pass some types, groups, or users, you will still get relevant results.
If someone asks about a specific builder or user, you can pass the user's fid to the users parameter and leave the query blank.
If you don't have more than a few words or a sentence to describe the query, you can leave the query blank, and just pass types, groups or users. Whatever fits best.

## Flows
When constructing the query, it might be helpful to think about what flow the query is about, and use a summary or keywords from the flow description to help with the query.
You can query to get a relevant flow first, by calling the queryEmbeddings tool with the type "flow" and the query including a summary of the flow.
When constructing the query, make sure to include as much information or keywords as possible to help with the vector search. Use context you know about flows to populate the query keywords. Make sure to make it extensive.
You can also use the numResults parameter to get more results. Ideally default to 5-10 results, but you can go up to 100.

## Tags
Tags you pass should only be the following: ${validTags.join(", ")}.

## Links
When you receive results from the queryEmbeddings tool, you should use the externalUrl field if possible, or the externalId field to add a markdown link to the specific application, flow, or grant you mention.
If the externalUrl is not available, you can use the externalId to link to the specific application, flow, or grant as a fallback.
For flows, you can link to https://flows.wtf/flow/[externalId].
For grants, you can link to https://flows.wtf/item/[externalId].
For applications, you can link to https://flows.wtf/application/[externalId].
For drafts, you can link to https://flows.wtf/draft/[externalId].
When linking to a cast, you can use the externalUrl field.
When linking to a builder profile, you can use warpcast.com/[username] or the externalUrl field if available.
Add the markdown link at the end of the part of the message where you mention the application, flow, or grant.
We will display the links in the chat as sources that are clickable links. 
The text of the markdown should be one word that embodies the application, flow, or grant you mention.
Never put the links in the middle of a paragraph or message, but rather at the end of the paragraph it is useful for.
`
