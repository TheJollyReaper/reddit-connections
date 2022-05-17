// require snoowrap
const snoowrap = require('snoowrap');

// define API credentials
const s = new snoowrap({
  userAgent: 'scriptapphcdecapstone',
  clientId: 'hQJu2h7ae10lGVNRSrRoOQ',
  clientSecret: 'dA4clYEh4rR7eWzADqt5vBCWCuUiRQ',
  username: 'hcdecapstone',
  password: 'URGTeam2022'
});

// Function to get subreddit icon
function getIcon(subreddit, s) {
    s.getSubreddit(subreddit).icon_img.then(console.log);
}

// subreddit to get information about 
var sub = 'trees';

// title
s.getSubreddit(sub).title.then(console.log); // funny

// end of url (i.e. '/r/funny')
s.getSubreddit(sub).url.then(console.log); // /r/funny

// short description
s.getSubreddit(sub).public_description.then(console.log); // Welcome to r/Funny, Reddit's largest humour depository.

getIcon(sub, s);