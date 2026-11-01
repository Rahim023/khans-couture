// Professional HTML Email Templates

export const customOrderCustomerTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #2a1a0f, #4d3528); color: #e6d4bc; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { background: white; padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2a1a0f; border-bottom: 2px solid #d4a574; padding-bottom: 10px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e6d4bc; }
        .info-label { font-weight: bold; color: #4d3528; }
        .info-value { color: #2a1a0f; }
        .highlight { background: #fbf7f1; padding: 15px; border-left: 4px solid #d4a574; margin: 15px 0; border-radius: 4px; }
        .footer { background: #f9f7f3; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e6d4bc; }
        .button { display: inline-block; background: #d4a574; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .cta { text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Khan's Couture</h1>
            <p>Your Custom Fashion Request Received</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${order.fullName}</strong>,</p>
            
            <p>Thank you for choosing Khan's Couture for your custom order! We're thrilled to help bring your fashion vision to life.</p>
            
            <div class="highlight">
                <strong>✓ Request Received Successfully</strong>
                <p>Your custom order enquiry has been received and saved.</p>
            </div>
            
            <div class="section">
                <div class="section-title">Order Details</div>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value">${order._id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Outfit Type:</span>
                    <span class="info-value">${order.outfitType}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Budget:</span>
                    <span class="info-value">₹${order.budget}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Delivery Date:</span>
                    <span class="info-value">${new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">📋 Under Review</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">What Happens Next?</div>
                <ol>
                    <li><strong>Review (24-48 hours):</strong> Our design team will carefully review your requirements and design preferences.</li>
                    <li><strong>Design Consultation:</strong> We'll reach out to discuss your vision in detail and suggest optimal designs.</li>
                    <li><strong>Quotation:</strong> You'll receive a detailed quotation with final pricing and timeline.</li>
                    <li><strong>Confirmation:</strong> Upon approval, we'll begin creating your custom piece.</li>
                </ol>
            </div>
            
            <div class="highlight">
                <strong>Expected Response Time:</strong> We'll get back to you within 24-48 hours at the latest!
            </div>
            
            <div class="section">
                <div class="section-title">Your Information</div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${order.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${order.phone}</span>
                </div>
            </div>
            
            <p><strong>Questions?</strong> Feel free to reach out to us directly at <strong>info.khanscouture@gmail.com</strong></p>
            
            <p>We look forward to creating something beautiful for you!</p>
            
            <p><strong>Best regards,</strong><br>
            The Khan's Couture Team 👗✨</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Khan's Couture. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>
</html>
`;

export const customOrderAdminTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #d4a574, #a77b4d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2a1a0f; border-bottom: 2px solid #d4a574; padding-bottom: 10px; margin-bottom: 15px; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e6d4bc; }
        .info-label { font-weight: bold; color: #4d3528; width: 30%; }
        .info-value { color: #2a1a0f; }
        .images { margin-top: 15px; }
        .image-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .image-link { background: #fbf7f1; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; }
        .footer { background: #f9f7f3; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .urgent { background: #ffe0e0; padding: 15px; border-left: 4px solid #d4a574; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 NEW CUSTOM ORDER RECEIVED</h1>
        </div>
        
        <div class="content">
            <div class="urgent">
                <strong>⏰ Action Required:</strong> Review and contact customer within 24 hours
            </div>
            
            <div class="section">
                <div class="section-title">Customer Information</div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${order.fullName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value"><a href="mailto:${order.email}">${order.email}</a></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value"><a href="tel:${order.phone}">${order.phone}</a></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${order.address}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Order Requirements</div>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span class="info-value"><strong>${order._id}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Type:</span>
                    <span class="info-value">${order.orderType}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Outfit Type:</span>
                    <span class="info-value">${order.outfitType}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Color Preference:</span>
                    <span class="info-value">${order.color || 'Not specified'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Budget:</span>
                    <span class="info-value"><strong>₹${order.budget}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Delivery Date:</span>
                    <span class="info-value">${new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
            </div>
            
            ${order.measurements ? `
            <div class="section">
                <div class="section-title">Customer Measurements</div>
                <div class="info-row">
                    <span class="info-label">Chest:</span>
                    <span class="info-value">${order.measurements.chest || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Waist:</span>
                    <span class="info-value">${order.measurements.waist || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Hip:</span>
                    <span class="info-value">${order.measurements.hip || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Shoulder:</span>
                    <span class="info-value">${order.measurements.shoulder || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sleeve Length:</span>
                    <span class="info-value">${order.measurements.sleeveLength || '-'}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">Design Preferences</div>
                <div class="info-row">
                    <span class="info-label">Fabric:</span>
                    <span class="info-value">${order.fabricPreference || 'Not specified'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Embroidery:</span>
                    <span class="info-value">${order.embroideryDetails || 'Not specified'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Special Notes:</span>
                    <span class="info-value">${order.specialInstructions || 'None'}</span>
                </div>
            </div>
            
            ${order.designImages && order.designImages.length > 0 ? `
            <div class="section">
                <div class="section-title">Reference Images (${order.designImages.length})</div>
                <div class="images">
                    <p><strong>Customer uploaded design references:</strong></p>
                    <div class="image-grid">
                        ${order.designImages.map((img, idx) => `<div class="image-link">📷 <a href="${img}" target="_blank">Image ${idx + 1}</a></div>`).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">Next Steps</div>
                <ol>
                    <li>Review customer requirements and measurements</li>
                    <li>Contact customer to confirm order details</li>
                    <li>Provide design consultation and quotation</li>
                    <li>Upon approval, add to production queue</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>Order submitted at: ${new Date(order.createdAt).toLocaleString()}</p>
            <p>© 2024 Khan's Couture Admin</p>
        </div>
    </div>
</body>
</html>
`;

export const orderConfirmationCustomerTemplate = (order, customer) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #2a1a0f, #4d3528); color: #e6d4bc; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; }
        .order-number { background: #fbf7f1; padding: 15px; text-align: center; border-radius: 4px; margin-bottom: 20px; }
        .order-number strong { font-size: 18px; color: #2a1a0f; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #2a1a0f; border-bottom: 2px solid #d4a574; padding-bottom: 10px; }
        .item { padding: 12px; background: #fbf7f1; margin: 8px 0; border-radius: 4px; display: flex; justify-content: space-between; }
        .item-name { font-weight: bold; }
        .item-price { color: #d4a574; }
        .total { background: linear-gradient(to right, #fbf7f1, #f9f7f3); padding: 15px; border-top: 2px solid #d4a574; margin-top: 15px; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
        .footer { background: #f9f7f3; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
            <p>Hi <strong>${customer.username}</strong>,</p>
            
            <p>Your order has been successfully placed and is being processed. Below are your order details.</p>
            
            <div class="order-number">
                Order ID: <strong>${order._id}</strong>
            </div>
            
            <div class="section">
                <div class="section-title">Order Items</div>
                ${order.items.map((item, idx) => `
                <div class="item">
                    <div>
                        <div class="item-name">${item.title}</div>
                        <small>Quantity: ${item.quantity} | Size: ${item.size}</small>
                    </div>
                    <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
                </div>
                `).join('')}
            </div>
            
            <div class="section">
                <div class="total">
                    <span>Total Amount:</span>
                    <span>₹${order.totalINR.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Order Status</div>
                <p><strong>Status:</strong> ${order.status}</p>
                <p>We're preparing your order for shipment. You'll receive tracking information via email soon.</p>
            </div>
            
            <p><strong>Need help?</strong> Contact us at <strong>info.khanscouture@gmail.com</strong></p>
            
            <p>Thank you for shopping with Khan's Couture! 👗✨</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Khan's Couture. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const orderConfirmationAdminTemplate = (order, customer) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #d4a574, #a77b4d); color: white; padding: 30px; text-align: center; }
        .content { background: white; padding: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; color: #2a1a0f; border-bottom: 2px solid #d4a574; padding-bottom: 8px; }
        .info-row { display: flex; padding: 8px 0; }
        .info-label { font-weight: bold; width: 25%; }
        .item { padding: 10px; background: #fbf7f1; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 NEW ORDER PLACED</h1>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">Customer Info</div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span>${customer.username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span>${customer.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order ID:</span>
                    <span><strong>${order._id}</strong></span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Items (${order.items.length})</div>
                ${order.items.map(item => `<div class="item">${item.quantity}x ${item.title} (${item.size}) - ₹${(item.price * item.quantity).toLocaleString()}</div>`).join('')}
            </div>
            
            <div class="section">
                <div class="info-row">
                    <span class="info-label">Total:</span>
                    <span><strong>₹${order.totalINR.toLocaleString()}</strong></span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const otpVerificationTemplate = (otp, username) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #2a1a0f, #4d3528); color: #e6d4bc; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; text-align: center; }
        .otp-box { background: linear-gradient(to right, #fbf7f1, #f9f7f3); padding: 20px; border-radius: 8px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d4a574; font-family: monospace; }
        .warning { background: #ffe0e0; padding: 15px; border-radius: 4px; margin: 15px 0; font-size: 12px; }
        .footer { background: #f9f7f3; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Khan's Couture</h1>
            <p>Your Verification Code</p>
        </div>
        
        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>Use the code below to verify your email address and activate your Khan's Couture account:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
            </div>
            
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            
            <div class="warning">
                <strong>⚠️ Security Warning:</strong> Never share this code with anyone. Khan's Couture staff will never ask for this code.
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Khan's Couture. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const newsletterWelcomeTemplate = (email) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f7f3; padding: 20px; }
        .header { background: linear-gradient(to right, #2a1a0f, #4d3528); color: #e6d4bc; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2a1a0f; margin-bottom: 15px; }
        .benefit { padding: 12px; background: #fbf7f1; margin: 10px 0; border-left: 4px solid #d4a574; border-radius: 4px; }
        .footer { background: #f9f7f3; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Welcome to Khan's Couture!</h1>
            <p>Your Fashion Journey Begins Here</p>
        </div>
        
        <div class="content">
            <p>Thank you for subscribing to our newsletter!</p>
            
            <div class="section">
                <div class="section-title">What to Expect</div>
                <div class="benefit">
                    🎁 <strong>Exclusive Offers:</strong> First access to special promotions and discounts
                </div>
                <div class="benefit">
                    👗 <strong>New Arrivals:</strong> Be the first to see our latest collections
                </div>
                <div class="benefit">
                    ✨ <strong>Fashion Tips:</strong> Styling advice and fashion inspiration
                </div>
                <div class="benefit">
                    🛍️ <strong>Seasonal Updates:</strong> Updates on upcoming sales and launches
                </div>
            </div>
            
            <div class="section">
                <p><strong>Stay Connected:</strong> Follow us for daily fashion inspiration and updates!</p>
            </div>
            
            <p>Welcome to the Khan's Couture family! We're excited to share our latest collections and offers with you.</p>
            
            <p><strong>Best regards,</strong><br>
            The Khan's Couture Team 👗✨</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Khan's Couture. All rights reserved.</p>
            <p>You received this email because you subscribed to our newsletter.</p>
        </div>
    </div>
</body>
</html>
`;
