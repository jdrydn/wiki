---
title: SVN - Extending the CLI
---

# {{ $frontmatter.title }}

Extending SVN's features to include common tasks such as tagging.

```bash
#!/bin/bash
# Just overriding the main SVN command
# So we can catch any requests to tag
# @javajawa++
function svn
{
  case "$1" in

    tag)
      if [ ! -d ".svn" ]; then
        echo "Not in an SVN directory. Navigate to an SVN folder and try again."
        return 1
      fi
      REPO=`svn info | grep 'URL' | awk '{print $NF}' | sed 's/.\{6\}$//'`
      TAG=`svn ls $REPO/tags | sed 's|[^0-9.]||g' | sort -uV | tail -n 1`
      echo "!!! LISTEN UP !!!"
      echo "This tagging script expects some things to be in place when you use it."
      echo "For starters, you must have checked out the TRUNK folder located at $REPO in order to successfully tag."
      echo "Otherwise, you'll break stuff when it tries to find a /tags folder."
      echo "YOU HAVE BEEN WARNED!"
      echo
      echo "SVN repository: $REPO"
      echo "The current tag for $REPO is $TAG"
      echo -n "New tag: "
      read NTAG
      echo "Tagging $REPO trunk as $NTAG"
      svn cp $REPO/trunk $REPO/tags/$NTAG -m "Tagging trunk as $NTAG." --quiet
      if [ "$2" = "live" ]; then
        echo "Tagging $REPO $NTAG as live"
        svn rm $REPO/tags/live -m "Removing live tag." --quiet
        svn cp $REPO/tags/$NTAG $REPO/tags/live -m "Promoting $NTAG to live." --quiet
      fi
      return 0
      ;;

    *) command svn $* ;;
  esac
}
```
