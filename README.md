### PROJECT for MODULE 2

Collaboration steps:

1. create a branch
   <git checkout -b branch-name>
2. make changes to your code
3. git add . (to add all file changes)
4. git commit -m "message goes here"
5. git pull origin master (to make sure you have the most up to data code)
6. if there are any conflicts then fix the conflicts in your editor
   6.2 git add . (to add the changes made on conflicts)
   6.3 git commit -m "message of what changed and that conflicts have been corrected"
   6.4 git pull origin master (pull again to make sure no changes while working on conflicts)

7. conflicts resolved or no conflicts found - git push origin <your-branch-name>
8. create pull request from your branch to the master branch
9. If no more conflicts found then merge your pull request

When you successfully merged do in the JSON file folder

`npm intall, add cloudinary keys and PORT in the .env and run node bin/seeds.js to get ready users.`
Note: if you make comments with your current user and add posts, and after that
for some reason you delete your user and recreate, it will give your an error.
So in that case delete first comments and posts collection before recreating
your single user!

test line
