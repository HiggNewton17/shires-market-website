# Form Submission Setup with Web3Forms

This guide will help you set up email notifications for your vendor signup form.

## Step 1: Get Your Web3Forms Access Key

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email address (use tj@higginswebsolutions.com for testing)
3. Click "Get Access Key"
4. Check your email for the access key

## Step 2: Update Your Code

1. Open `script.js` 
2. Find line 111 where it says `access_key: 'YOUR_ACCESS_KEY_HERE'`
3. Replace `YOUR_ACCESS_KEY_HERE` with the access key you received via email

Example:
```javascript
access_key: '123e4567-e89b-12d3-a456-426614174000', // Your actual key
```

## Step 3: Test the Form

1. After updating the access key, commit and push your changes:
   ```
   git add .
   git commit -m "Add Web3Forms integration for email notifications"
   git push
   ```

2. Wait 1-2 minutes for Vercel to deploy
3. Test the form on your live site
4. Check tj@higginswebsolutions.com for the test email

## Step 4: Change to Production Email

Once testing is complete, to change the email to ShiresFarmersMarket@proton.me:

1. Go back to [web3forms.com](https://web3forms.com)
2. Get a new access key for ShiresFarmersMarket@proton.me
3. Replace the access key in script.js
4. Commit and push the changes

## Alternative: Use Environment Variables (Recommended)

For better security, you can use Vercel environment variables:

1. In your Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - Name: `WEB3FORMS_ACCESS_KEY`
   - Value: Your access key
4. Update script.js to use: `access_key: process.env.WEB3FORMS_ACCESS_KEY`

## Form Fields Sent

The form will send the following information:
- First Name
- Last Name
- Email Address
- Phone Number
- Business/Farm Name (if provided)
- Products they'll be selling
- Previous farmers market experience (if provided)
- Confirmation that they agree to market rules

## Troubleshooting

If forms aren't being received:
1. Check that the access key is correct
2. Check your spam/junk folder
3. Make sure you're using the email associated with the access key
4. Check the browser console for any errors