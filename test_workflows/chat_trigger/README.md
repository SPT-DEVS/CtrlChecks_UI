# Chat Trigger Test Workflows - Reference Guide

This folder contains test workflows for the Chat Trigger node, testing various logic and social media nodes.

## 📁 Workflow Files

### Logic Node Tests

1. **chat_trigger_switch.json** - Tests Switch node for routing messages
2. **chat_trigger_function.json** - Tests Function node for message processing
3. **chat_trigger_merge.json** - Tests Merge node for combining data
4. **chat_trigger_wait.json** - Tests Wait node for delays
5. **chat_trigger_limit.json** - Tests Limit node for array limiting
6. **chat_trigger_aggregate.json** - Tests Aggregate node for data aggregation
7. **chat_trigger_sort.json** - Tests Sort node for sorting arrays
8. **chat_trigger_code.json** - Tests JavaScript/Code node for custom code execution
9. **chat_trigger_function_item.json** - Tests Function Item node for processing array items
10. **chat_trigger_noop.json** - Tests NoOp node for pass-through

### Social Media Node Tests

11. **chat_trigger_whatsapp.json** - Tests WhatsApp Cloud API node
12. **chat_trigger_instagram.json** - Tests Instagram node for posting
13. **chat_trigger_youtube.json** - Tests YouTube node for API interactions

---

## 🚀 How to Test

### 1. Import Workflow
- Open your workflow editor
- Import the JSON file you want to test
- Ensure the workflow is activated

### 2. Configure Credentials (for Social Media workflows)
- **WhatsApp**: Set `phoneNumberId` and `accessToken` in node config
- **Instagram**: Set `accessToken` and `accountId` in node config
- **YouTube**: Set `apiKey` and optionally `channelId` in node config

### 3. Access Chat Interface
- Navigate to: `/api/chat-trigger/:workflowId/:nodeId`
- Replace `:workflowId` with your workflow ID
- Replace `:nodeId` with the chat trigger node ID (usually `node_1`)

### 4. Send Test Messages
- Use the chat interface to send test messages
- Monitor workflow execution in the logs

---

## 📝 Input Examples

### Chat Trigger Input Format

When a message is sent via chat trigger, the input to the workflow will be:

```json
{
  "message": "User's chat message text",
  "sessionId": "chat_session_id",
  "userId": "user_id_if_available",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Test Input Examples by Workflow

#### 1. Switch Node Test
**Input Message Examples:**
- `"help"` - Routes to Help branch
- `"order"` - Routes to Order branch
- `"support"` - Routes to Support branch

**Expected Behavior:**
- Message "help" → Logs "Help branch: help"
- Message "order" → Logs "Order branch: order"
- Message "support" → Logs "Support branch: support"

#### 2. Function Node Test
**Input Message:**
```json
{
  "message": "Hello world test"
}
```

**Expected Output:**
```json
{
  "originalMessage": "Hello world test",
  "processedMessage": "HELLO WORLD TEST",
  "wordCount": 3,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 3. Merge Node Test
**Input Message:**
```json
{
  "message": "Test merge"
}
```

**Expected Output:**
- Merges user data (userName, userId) with message data (message, timestamp)
- Result: Combined object with all fields

#### 4. Wait Node Test
**Input Message:**
```json
{
  "message": "Test wait"
}
```

**Expected Behavior:**
- Waits 2 seconds (2000ms) before processing
- Then logs the message

#### 5. Limit Node Test
**Input Message:**
```json
{
  "message": "Test limit"
}
```

**Expected Output:**
- Creates array [1,2,3,4,5,6,7,8,9,10]
- Limits to first 5 items: [1,2,3,4,5]

#### 6. Aggregate Node Test
**Input Message:**
```json
{
  "message": "Test aggregate"
}
```

**Expected Output:**
- Creates items array with prices: [10, 20, 15, 25]
- Sums all prices: 70

#### 7. Sort Node Test
**Input Message:**
```json
{
  "message": "Test sort"
}
```

**Expected Output:**
- Creates items: [{price: 30}, {price: 10}, {price: 20}]
- Sorts ascending: [{price: 10}, {price: 20}, {price: 30}]

#### 8. Code/JavaScript Node Test
**Input Message:**
```json
{
  "message": "Hello world"
}
```

**Expected Output:**
```json
{
  "original": "Hello world",
  "wordCount": 2,
  "reversed": "dlrow olleH",
  "words": ["Hello", "world"]
}
```

#### 9. Function Item Node Test
**Input Message:**
```json
{
  "message": "Test function item"
}
```

**Expected Output:**
- Processes each item in array
- Adds `processed: true`, `doubled` value, and `index` to each item

#### 10. NoOp Node Test
**Input Message:**
```json
{
  "message": "Test noop"
}
```

**Expected Behavior:**
- Passes input through unchanged
- Logs original message

#### 11. WhatsApp Node Test
**Input Message:**
```json
{
  "message": "Hello from chat!"
}
```

**Configuration Required:**
```json
{
  "phoneNumberId": "123456789012345",
  "accessToken": "EAAG...",
  "to": "1234567890",
  "message": "Hello! You sent: {{input.message}}"
}
```

**Expected Behavior:**
- Sends WhatsApp message with chat message content
- Logs confirmation

#### 12. Instagram Node Test
**Input Message:**
```json
{
  "message": "Check out this post!"
}
```

**Configuration Required:**
```json
{
  "accessToken": "YOUR_INSTAGRAM_ACCESS_TOKEN",
  "accountId": "17841405309211844",
  "operation": "create_image_post",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Chat message: {{input.message}}"
}
```

**Expected Behavior:**
- Creates Instagram post with image and caption
- Caption includes the chat message

#### 13. YouTube Node Test
**Input Message:**
```json
{
  "message": "List my videos"
}
```

**Configuration Required:**
```json
{
  "apiKey": "YOUR_YOUTUBE_API_KEY",
  "operation": "list_videos",
  "channelId": "UCxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "maxResults": 5
}
```

**Expected Behavior:**
- Retrieves list of videos from YouTube channel
- Returns up to 5 videos

---

## 🔧 Configuration Guide

### WhatsApp Cloud API Setup

1. **Get Phone Number ID:**
   - Go to https://developers.facebook.com
   - Select your Meta App
   - Click "WhatsApp" → "API Setup"
   - Find "Phone number ID" in the "From" section
   - Copy the numeric ID

2. **Get Access Token:**
   - For Testing: Use temporary token from API Setup (expires in 24 hours)
   - For Production: Create System User in Business Settings
   - Assign `whatsapp_business_messaging` permission
   - Generate token

3. **Recipient Number Format:**
   - Country code + number (no +, spaces, or dashes)
   - Example: US `+1 (234) 567-8900` → `12345678900`
   - Example: India `+91 98765 43210` → `919876543210`

### Instagram Graph API Setup

1. **Get Access Token:**
   - Go to developers.facebook.com
   - Create or select an App
   - Add "Instagram Graph API" product
   - Connect your Instagram Business Account
   - Generate token with permissions: `instagram_basic`, `instagram_content_publish`

2. **Get Instagram Business Account ID:**
   - Go to Graph API Explorer
   - Query: `GET /me/accounts` → Get page ID
   - Query: `GET /{page-id}?fields=instagram_business_account`
   - Copy the `instagram_business_account.id` value

### YouTube Data API Setup

1. **Get API Key:**
   - Go to console.cloud.google.com
   - Create a project or select existing
   - Enable "YouTube Data API v3"
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key

2. **Get Channel ID:**
   - Go to channel URL: `youtube.com/channel/CHANNEL_ID`
   - Copy the ID after `/channel/`
   - Or use "mine" for authenticated user's channel

3. **OAuth Access Token (for upload/update operations):**
   - Use OAuth 2.0 flow
   - Request scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube`
   - Get token from OAuth response

---

## 📊 Testing Checklist

### For Each Workflow:

- [ ] Import workflow JSON
- [ ] Activate workflow
- [ ] Configure credentials (if required)
- [ ] Access chat interface
- [ ] Send test message
- [ ] Verify node execution in logs
- [ ] Check output matches expected format
- [ ] Test edge cases (empty messages, special characters, etc.)

### Common Test Cases:

1. **Basic Message:**
   ```
   "Hello world"
   ```

2. **Empty Message:**
   ```
   ""
   ```

3. **Special Characters:**
   ```
   "Test @#$%^&*() message!"
   ```

4. **Long Message:**
   ```
   "This is a very long message that contains many words and should test how the workflow handles longer input strings..."
   ```

5. **JSON-like Message:**
   ```
   "{\"key\": \"value\"}"
   ```

---

## 🐛 Troubleshooting

### Chat Trigger Not Firing
- Ensure workflow is activated (`status: "active"`)
- Check chat trigger node ID matches URL parameter
- Verify chat session is created

### Node Execution Errors
- Check node configuration matches expected format
- Verify input data structure matches node requirements
- Review logs for specific error messages

### Social Media API Errors
- Verify credentials are correct and not expired
- Check API permissions and scopes
- Ensure rate limits are not exceeded
- Review API documentation for required fields

### Template Variable Issues
- Use `{{input.fieldName}}` for accessing input data
- Use `{{$json.fieldName}}` for accessing previous node output
- Ensure field names match exactly (case-sensitive)

---

## 📚 Additional Resources

- [Chat Trigger Documentation](../../docs/nodes/chat-trigger.md)
- [Node Usage Guides](../../src/components/workflow/nodeUsageGuides.ts)
- [Workflow Execution Guide](../../worker/src/api/execute-workflow.ts)

---

## 💡 Tips

1. **Start Simple:** Test basic workflows first before complex ones
2. **Use Log Output:** Add log nodes to debug data flow
3. **Test Incrementally:** Test one node at a time
4. **Monitor Logs:** Check execution logs for detailed information
5. **Save Test Cases:** Document successful test inputs for future reference

---

## 📝 Notes

- All workflows use `chat_trigger` as the starting node
- Social media workflows require valid API credentials
- Test workflows are designed for development/testing environments
- Production use requires proper error handling and validation
- Some nodes may require specific input formats (check node documentation)

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
