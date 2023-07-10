# ToDo
<!-- ![](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNgS4NjTHOlP7WmZ3pIngUGbEa8IQ3yOVvfg&usqp=CAU) -->
 
## Next Steps

- [x] User register
- [x] User login
- [x] CheckEmail
- [x] Password minimum size
- [x] CheckName
- [x] TestaCPF
- [x] httpUpdateUser validation
- [x] httpUpdateUserEmail 
- [ ] [Review GitHub vulnerabilities]('https://github.com/lpkyrius/newsavic-api/security/dependabot')
##### Based on [changes I've done based on this video]('https://youtu.be/yY2gXnRGVUw?list=PLk8gdrb2DmCi-9ys7sVZvKNQISs5Bkw-t')
- [x] I. Finish users.controller > checkEmailExists(email) 
- [x] II. Finish users.controller > checkCPFExists(cpf)
- [x] III. Test changes/validations for Register & SignIn
##### [This video]('https://youtu.be/v6Ul3o8D-js?list=PLk8gdrb2DmCi-9ys7sVZvKNQISs5Bkw-t&t=286') and [this one]('https://youtu.be/XqOIjQ78oJA?list=PLk8gdrb2DmCi-9ys7sVZvKNQISs5Bkw-t') will help me to: 
- [ ] I. Add a hash field on user table to save the key for verify user, avoiding emailing the real id as a param for the verification link. 
- [ ] II. Add .env file and adjust email password and other current secret values to it.
- [ ] III. Add expiration date for Register.

Note: In case I need another example [here we go]('https://youtu.be/T6rElSLldyc')

##### Still about the Register/SignIn
- [ ] I. Complement to register: Forgot password (password recovery with email) [this video]('https://youtu.be/72JYhSoVYPc') seems to have JWT and other interesting logic like expiration date, etc. It worths to check.
- [ ] II. Review (best practices) data validation when receiving Register and Login requests. How to avoid SQL injections, etc. Same to avoid several requisitions attacks. For example, **create an user with limited privileges such as no access to create/drop/truncate tables/databases**.
- [ ] III. Captcha [check this video]('https://youtu.be/u_QXNT4o_64')
- [ ] IV. Disable (excluir ou desativar conta?)

##### And ...

- [ ] Complement tests for Users +  POST tests for grupos
- Testing my server:
- Listing (GET) grupos using json
- Posting (POST) grupos -> [class 123]('https://www.udemy.com/course/complete-nodejs-developer-zero-to-mastery/learn/lecture/26172358#overview')
- [x] NodeJS  132. Jest:  3’20
```
npm install jest --save-dev
npm install supertest --save-dev
```
- [x] NodeJS  133. SuperTest: 1’10 ⚠️
* I've already installed and created the 1st test (GET)
* For POST test, as soon as the POST is done, check [Class 134]('https://www.udemy.com/course/complete-nodejs-developer-zero-to-mastery/learn/lecture/26199790#overview') 
- [ ] TypeScript NodeJS 394. TypeScript Installation implementation which still keeps flexibility [check this video]('https://youtu.be/AIVWz9tDIxM?t=428') => Let's do it before continue.
- [ ] Knex.js Migration [for example]('https://youtu.be/6HmC32AY41k')
- [ ] User roles, token: [check this video]('https://youtu.be/Tw5LupcpKS4')

<br>
- [x] Create Project with NodeJS 107. API Server Setup 
```
npm init -y
npm install express 
npm install --save-dev nodemon
```
#### Focus on essentials only!!! 👀
* What are the **trully main features** we need as a 1st version?
* What's the **priority**?
* After that, **review if the next features still make sense**.
* What's the **priority now**?



#### Note about the sequence:
1. Server > App
2.1 Forward approach: Router > Controller > Model
2.2 Bottom UP approach: Model > Router > Controller

## Testing Area
Access _localhost_ [here](http://localhost:8000/grupos)


## Next Steps
#### Frontend 
* Check [Class vs Hooks]('https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/learn/lecture/26127202#overview') and mainly [here]('https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/learn/lecture/36906286#overview')
* NextJS? May be it'd be better 
* [Redux]('https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/learn/lecture/10173568#overview')