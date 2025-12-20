+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
[sitemap]
  changefreq = 'daily'
  disable = true
  priority = 0.8
+++
