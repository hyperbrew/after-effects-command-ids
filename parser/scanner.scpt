-- Run Script
-- Copy results to file
-- Clean up any syntax errors and fix \" with "
-- Remove curly quotes
-- Remove any ...
-- Remove any "missing value"
-- Remove email
-- Remove Apple menu
-- Remove : (none)


tell application "System Events"
	tell process "After Effects"
		set resultString to "{"
		tell menu bar 1
			set menuBarItems to name of every menu bar item
			repeat with menuName in menuBarItems
				set menuItemsString to ""
				tell menu bar item menuName
					tell menu menuName
						repeat with i from 1 to (count of menu items)
							set menuItemName to name of menu item i
							set menuItemsString to menuItemsString & "\"" & menuItemName & "\""
							if i is not (count of menu items) then set menuItemsString to menuItemsString & ", "
						end repeat
					end tell
				end tell
				set resultString to resultString & "\"" & menuName & "\":[" & menuItemsString & "]"
				if menuName is not item -1 of menuBarItems then set resultString to resultString & ", "
			end repeat
		end tell
		set resultString to resultString & "}"
		return resultString
	end tell
end tell
