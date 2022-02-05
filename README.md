[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/amamenko/breaking-casting-news#gh-dark-mode-only">
   <img src="./assets/BCN_Logo_White.svg" width="1500" />
  </a>
   <a href="https://github.com/amamenko/breaking-casting-news#gh-light-mode-only">
    <img src="./assets/BCN_Logo.svg" width="1500" />
  </a>
  <h3 align="center" height="50">Breaking Casting News</h3>
  <p align="center">
    A (Fake) Movie Casting News Twitter Account
    <br />
    Automated with Node.js
    <br />
    <br />
    <a href="https://twitter.com/BreakingCasting">View Twitter</a>
    ·
    <a href="https://github.com/amamenko/breaking-casting-news/issues">Report Issue</a> 
  </p>
</p>


## Background

According to Science.org, [fake news spreads faster than true news on Twitter](https://www.science.org/content/article/fake-news-spreads-faster-true-news-twitter-thanks-people-not-bots). A cited research article found that between 2006 ([Twitter's](https://en.wikipedia.org/wiki/Twitter) inception) to 2017, false tweets were 70% more likely to be retweeted than truthful ones. In some cases, these false tweets are made with ill-intent. For example, following the [COVID-19 pandemic](https://en.wikipedia.org/wiki/COVID-19_pandemic), a spotlight had been shone on the rise of [COVID-19 misinformation](https://spectrum.ieee.org/twitter-bots-are-spreading-massive-amounts-of-covid-19-misinformation) due to Twitter bots.

A [Twitter bot](https://en.wikipedia.org/wiki/Twitter_bot) is type of bot software that controls a Twitter account via the [Twitter API](https://developer.twitter.com/en/docs/twitter-api) and may autonomously perform such functions as tweeting and re-tweeting. Twitter bots are not necessarily negative as they are sometimes capable of automatically generating interesting or creative content. 

## Functionality

<p align="center">
<a href="https://twitter.com/BreakingCasting">
    <img  src="./assets/Example_Tweet.png" width="600" />
</a>
</span>
<br/ >
<br />

Breaking Casting News generates automated movie remake announcements via an Express server that runs a daily 2PM Eastern Time CRON job via [node-cron](https://www.npmjs.com/package/node-cron). If the [@BreakingCasting](https://twitter.com/BreakingCasting) Twitter account has not yet made a tweet that day, a movie is randomly selected from a curated list of films (with releases spanning the years 1960-2018) provided by the [Movies Names](https://www.npmjs.com/package/movies-names) NPM package.

If a cast list (name of the original actor next to his or her character name) can be determined from the film's Wikipedia page (scraped with [WikiJs](https://www.npmjs.com/package/wikijs)), then at least two and no more than 4 top billed actors' images are acquired from a Google image search (Twitter only allows [at most 4 images](https://influencermarketinghub.com/twitter-image-size/) to be posted per tweet).

Once the original actors' images have all been acquired, these images are used to find [doppelgangers](https://en.wikipedia.org/wiki/Doppelg%C3%A4nger) of the original actors. These doppelgangers are chosen to play each original actor's characters in the chosen movie remake.

Each original actor's image is uploaded to [StarByFace](https://starbyface.com/) to attempt to find a similar-looking actor using their neural network. If a potential series of matches is found, a random doppelganger is chosen from the top 5 results. If the original actor's name is among the found matches, that match is filtered out.

Inevitably, some of the doppelgangers that are found will be of famous individuals who are no longer alive. In order to determine whether or not a found match is alive, the individual's Wikipedia page is scraped using [WikiJs](https://www.npmjs.com/package/wikijs). If a date of death is found in the info section, that individual is determined to have passed on. The age of the individual when they died and the cause of death is also acquired if such information is available.

If at least two doppelgangers of the original film's actors are found, a Twitter post can be made. A CSV file of over 300 popular modern film studios is used to select a random studio for a remake announcement. Each tweet includes the studio name, the remake film's title, its original release date, a remake release date of 1-3 years in advance, the found doppelgangers' names with their associated character name, and attached images of the found doppelgangers.

As of 2022, Twitter's character limit for tweets is [280 characters](https://tecvalue.com/how-long-can-a-tweet-be/). If the particular tweet happens to contain more than 280 characters, the last found doppelganger is abandoned. If the tweet contains at least two doppelgangers at this point, the tweet proceeds - otherwise, the tweet itself is abandoned.

If any or all of the found doppelgangers are found to be deceased, a tweet thread is started from the original tweet that includes updates and apologies from the studio alongside the person's date of death, age at time of death, and cause of death, if available.

## Deployment

Server deployed via [Heroku](https://www.heroku.com/). Free Heroku dyno kept awake with [UptimeRobot](https://uptimerobot.com/).


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->
## Contact

Avraham (Avi) Mamenko - avimamenko@gmail.com

Project Link: [https://github.com/amamenko/breaking-casting-news](https://github.com/amamenko/breaking-casting-news)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Twitter](https://twitter.com/)
* [twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2)
* [WikiJs](https://www.npmjs.com/package/wikijs)
* [StarByFace](https://starbyface.com/)
* [node-cron](https://www.npmjs.com/package/node-cron)
* [Movies Names](https://www.npmjs.com/package/movies-names)
* [Heroku](https://www.heroku.com/)
* [UptimeRobot](https://uptimerobot.com/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/amamenko/breaking-casting-news/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/avrahammamenko
