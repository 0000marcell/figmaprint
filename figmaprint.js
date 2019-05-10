#!/usr/bin/env node

const readstdin = require('readstdin');
const fetch = require('node-fetch');
const headers = new fetch.Headers();
const baseUrl = 'https://api.figma.com';
const fs = require('fs'),
      request = require('request');

var downloadImage = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};



function getImageURL(resp) {
  if(typeof resp.images !== 'array') {
    return resp.images[Object.keys(resp.images)[0]];
  } else {
    console.error('do not suport more than one id!')
  }
}

async function run() {
  data = await readstdin(); 
  data = JSON.parse(data);
  if(!data) {
    console.error('no data was piped to the program!');
    return;
  }

  let token = data.headers.token,
      id = data.headers.id;

  headers.set('X-Figma-Token', token);
  let url = `${baseUrl}/v1/images/${id}?ids=${data.document.id}`;
  let resp = await fetch(url, 
    {headers});
  resp = await resp.json(); 
  downloadImage(getImageURL(resp), `${data.document.id}.png`, function(){
    console.log('done');
  });
}

run();
