# Static website generator

Yesterday night around 23:00 I was getting ready to go to bed, until suddenly I had a brilliant idea.
"Lets put together the static website generator!"
Initially I wanted to wait until tomorrow, but we all know how things like this go.
"It can't be that hard, right?, It can't take that long, right?".

...and thus I proceeded the next 4 hours reading up (scarse) documentation on JSDOM and Prism to get it to work.
But here we are, it's done and it runs like a charm.

## Options

Personally I'm not entirely happy about using JS for this, but it's the only language with decent syntax highlighters that suit my needs.
I tried to replace JSDOM with Cheerio since the latter one has less dependencies.
However the jQuery syntax is annoying and it just doesn't wanna play nice with editing individual nodes with the same tags containing different text, so I dropped the idea.

As for compression, I could probably squeeze a bit more out of it by going from jpg to webp, but to me that is not worth it.
I do intent to strip the bootstrap css so I can modify it to my own needs (remove most of the clutter).

Really glad that I'm not depending on Jekyll at least (industry-standard tool for generating static webpages).
Ruby ain't my forte and it seemed way to complex for what I actually need.

## Results

What I am very happy about is that it's running really fast on older browsers and on bad network connections.

- Mobile version: ~500Kb and takes ~1sec to load on heavily loaded public wifi
- Desktop version:  < 1Mb and still looks good on 4k monitors

If that size is still too heavy for someone, he is free to disable image loading on the website as nothing will break.
I also really like the idea of not having scripts running client-side.
Perhaps the biggest upside from all of this is that now my website can be archived by archive.org or alike.

## What's next

- Revamp the index page so I don't have to regenerate all pages every single time.
- Getting rid of bootstrap css that I don't use
- Dark mode for the website

Enough ideas at least, we'll see what comes of it!
