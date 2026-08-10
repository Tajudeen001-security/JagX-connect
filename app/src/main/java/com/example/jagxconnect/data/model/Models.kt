package com.example.jagxconnect.data.model

data class UserProfile(
    val id: String,
    val name: String,
    val handle: String,
    val avatarUrl: String,
    val rankBadge: String,
    val memberCardTier: String,
    val bio: String,
    val followersCount: Int,
    val followingCount: Int,
    val coinsBalance: Int
)

data class Post(
    val id: String,
    val authorId: String,
    val authorName: String,
    val authorHandle: String,
    val authorAvatar: String,
    val timestamp: String,
    val content: String,
    val imageUrl: String? = null,
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val giftsCount: Int = 0,
    val isLiked: Boolean = false,
    val isSaved: Boolean = false
)

data class Story(
    val id: String,
    val userId: String,
    val userName: String,
    val userAvatar: String,
    val hasUnseen: Boolean = true
)

data class Reel(
    val id: String,
    val creatorId: String,
    val creatorName: String,
    val creatorHandle: String,
    val creatorAvatar: String,
    val caption: String,
    val soundTitle: String,
    val likesCount: Int,
    val commentsCount: Int,
    val isLiked: Boolean = false,
    val videoUrl: String = ""
)

data class LiveRoom(
    val id: String,
    val hostId: String,
    val hostName: String,
    val hostAvatar: String,
    val title: String,
    val viewerCount: Int,
    val category: String
)

data class LiveComment(
    val id: String,
    val userName: String,
    val userAvatar: String,
    val message: String,
    val giftTag: String? = null
)

data class ProductListing(
    val id: String,
    val title: String,
    val description: String,
    val priceCoins: Int,
    val priceUsd: Double,
    val category: String,
    val imageUrl: String,
    val sellerName: String,
    val location: String
)

data class Conversation(
    val id: String,
    val partnerName: String,
    val partnerAvatar: String,
    val lastMessage: String,
    val lastTimestamp: String,
    val unreadCount: Int = 0
)

data class DirectMessage(
    val id: String,
    val senderId: String,
    val content: String,
    val timestamp: String,
    val isMe: Boolean,
    val mediaUrl: String? = null
)

data class MemberCard(
    val cardNumber: String,
    val holderName: String,
    val validThru: String,
    val tier: String,
    val perks: List<String>
)

data class InvestmentProject(
    val id: String,
    val title: String,
    val description: String,
    val returnRate: String,
    val raisedAmount: Double,
    val targetAmount: Double,
    val minInvestment: Double,
    val imageUrl: String
)

data class NotificationItem(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val iconType: String // "gift", "follow", "like"
)
