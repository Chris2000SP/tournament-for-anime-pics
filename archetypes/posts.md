---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: false
tags: ["posts", "neu"]
categories: ["Allgemein"]
layout: "posts"  # Verweis auf ein Layout (falls du mehrere Layouts hast)
---
# {{ .Name }}