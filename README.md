# WhatApp chat analytics

## What does this do?

This started as me just wanting to see what the most use emoji was in some of my chats.

It can now:
 - tell you the 100 most common words used in your chat, excluding boring common ones like 'and', 'what', 'where' etc.
 - tell you the 10 most common emojis
 - tell you your 3 most busy days of the week; maybe you do a lot of messaging on Tuesdays?
 - tell you who sent what number of messsages in the chat
 - tell you the top 5 most busy hours (ie # of messages sent in that hour) for that chat


It cannot:
 - automate the process for you, you need to export your chat .txt and upload it into the folder where this code is


## Getting started

How to get your WhatsApp chat as a `.txt` file

https://user-images.githubusercontent.com/36296712/210245498-f246426a-4ee6-4ce4-bd7a-14c2a6c392a9.mp4

Clone this repo.

Navigate to the directory and install the dependencies.

```
$ yarn install
```

Copy your chat `.txt` file to the same repo and rename to chat.txt

To run, use the following command

```
$ yarn start
```
