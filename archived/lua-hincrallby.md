# Lua - HINCRALLBY

Grab your shovels, that Redis instance won't be around much longer.

```lua
-- Usage: HINCRALLBY AKeyOfYourChoice 1
--   HKEYS AKeyOfYourChoice
--   HINCRBY AKeyOfYourChoice KEY 1
local keys = redis.call("HKEYS", ARGV[1])
local results = {}
for i,k in ipairs(keys) do
  results[i] = redis.call("HINCRBY", ARGV[1], keys[i], ARGV[2])
end
return results
```
