export class RedditApi {
    constructor() {

      // define API credentials
      this.s = new snoowrap({
        userAgent: 'scriptapphcdecapstone',
        clientId: 'hQJu2h7ae10lGVNRSrRoOQ',
        clientSecret: 'dA4clYEh4rR7eWzADqt5vBCWCuUiRQ',
        username: 'hcdecapstone',
        password: 'URGTeam2022'
      });
    }

  // Function to get subreddit icon
  getIcon(subreddit) {
      // this.s.getSubreddit(subreddit).icon_img.then(value=>{this.returnValues(value)});

      const sub_link = this.s.getSubreddit(subreddit).icon_img;
      return sub_link;
      // return String(this.s.getSubreddit(subreddit).icon_img.then( ));
  }

  getCommImage(subreddit) {
    // this.s.getSubreddit(subreddit).icon_img.then(value=>{this.returnValues(value)});

    const sub_link = this.s.getSubreddit(subreddit).community_icon;
    return sub_link;
    // return String(this.s.getSubreddit(subreddit).icon_img.then( ));
}

  getDescription(subreddit) {
    const description = this.s.getSubreddit(subreddit).public_description;
    return description;
  }

  // var sub = 'trees';

  // // title
  // s.getSubreddit(sub).title.then(console.log); // funny

  // // end of url (i.e. '/r/funny')
  // s.getSubreddit(sub).url.then(console.log); // /r/funny

  // // short description
  // s.getSubreddit(sub).public_description.then(console.log); // Welcome to r/Funny, Reddit's largest humour depository.

  // getIcon(sub, s);
}