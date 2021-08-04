formMe
========

Version - 2.3.1
- Give possibility to access files uploaded via $_FILES

Version - 2.3.0
- Add format param into field definition to allow function to format field value before ajax call

Version - 2.2.0
- Update validateMe to have IMask
- Doc update to have example of IMask

Version - 2.1.0
- Add recaptcha detection for automatic recaptcha validation before ajax call

Version - 2.0.4
- Fix me:form:data

Version - 2.0.3
- Merge fields data to use the validateMe fields reference.
- Revert data sent to be formatted by serializeArray.
- Add removeFields function to remove multiple fields at once
- Add addFields function to add multiple fields at once
- Add resetFieldState function when field is removed

Version - 2.0.2
- Fix remove field
- Data send is based on validated value instead of form value.

Version - 2.0.0
- Refactor for ES6
- Split into classes. Added a forms manager and base form class
- Add new demo for added options