# Custom bootstrap

The title probably gave away what I've been up to today.
200Kb of styling and 400Kb on top of that for source mapping is too big if I wanted to have my site look nice while keeping the site < 1Mb.
There is a whole lot in there that I don't use, so I might as well strip it out.
And so, here we are!

Stripped it all by hand (I'm not proficient with sass/scss compilers) which was an easy task, just takes 2 hours or so (including debugging and releasing). I really like doing this kind of grunt work myself, since its quite relaxing for the brain. I think alot on a day, so this is a good oppertunity for doing something dumb and simple.

## Results

I went from ~200Kb `bootstrap.min.css` to my custom uncompressed 6Kb css file that has only the bits I needed.
That means that the website went from ~910Kb to a much more comfortable 710Kb in desktop mode.
The mobile website went from ~510Kb to 310Kb.

Sure I could get rid of the banner image and have the page load instantly because of it and I know most people won't care what that banner is gonna look like, but I personally really like the image too much to remove it.

## What's next

I do wanna make some quick changes to make adding new pages less work (storing less repeating info in `index.json`) and then probably see how far I can keep reducing the website size without compromises. Removing a tiny bit more weight can't hurt!
