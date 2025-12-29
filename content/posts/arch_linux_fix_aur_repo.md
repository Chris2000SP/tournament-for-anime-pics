+++
date = '2025-12-25T16:54:25+01:00' # 2025-12-17T04:45:18+01:00
draft = false
title = 'Arch Linux libalpm.so.15 problem fixen'
tags = ["posts", "neu"]
categories = ["Linux"]
layout = "posts"
[sitemap]
  changefreq = 'daily'
  disable = false
  priority = 0.8
+++
# Arch Linux AUR Problem lösen
## pacaur oder auch yay möchte nicht so richtig arbeiten
```auracle: error while loading shared libraries: libalpm.so.15: cannot open shared object file: No such file or directory```  
```sudo ln -s /usr/lib/libalpm.so.16 /usr/lib/libalpm.so.15```  
Problem gelöst!