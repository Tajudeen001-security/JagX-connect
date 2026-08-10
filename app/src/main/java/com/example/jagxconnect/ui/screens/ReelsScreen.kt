package com.example.jagxconnect.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.jagxconnect.data.model.Reel
import com.example.jagxconnect.ui.components.CoinGiftDialog

@Composable
fun ReelsScreen(
    reels: List<Reel>,
    userCoins: Int,
    onSendGiftToCreator: (String, Int) -> Unit
) {
    var activeReelIndex by remember { mutableStateOf(0) }
    var selectedReelForGift by remember { mutableStateOf<Reel?>(null) }
    val currentReel = reels.getOrNull(activeReelIndex) ?: return

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Video poster placeholder / background image
        AsyncImage(
            model = "https://picsum.photos/seed/reel_bg_${currentReel.id}/800/1200",
            contentDescription = "Reel background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Overlay gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.35f))
        )

        // Navigation arrows for reel switching
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Reels",
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                color = Color.White
            )

            Row {
                IconButton(
                    onClick = { if (activeReelIndex > 0) activeReelIndex-- },
                    enabled = activeReelIndex > 0
                ) {
                    Icon(Icons.Filled.KeyboardArrowUp, "Prev Reel", tint = Color.White)
                }
                IconButton(
                    onClick = { if (activeReelIndex < reels.size - 1) activeReelIndex++ },
                    enabled = activeReelIndex < reels.size - 1
                ) {
                    Icon(Icons.Filled.KeyboardArrowDown, "Next Reel", tint = Color.White)
                }
            }
        }

        // Action Rail on right
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 16.dp, bottom = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Like
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                IconButton(onClick = { }) {
                    Icon(
                        imageVector = if (currentReel.isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Like",
                        tint = if (currentReel.isLiked) Color.Red else Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
                Text("${currentReel.likesCount}", color = Color.White, fontSize = 12.sp)
            }

            // Comment
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                IconButton(onClick = { }) {
                    Icon(
                        Icons.Outlined.ChatBubbleOutline,
                        "Comments",
                        tint = Color.White,
                        modifier = Modifier.size(30.dp)
                    )
                }
                Text("${currentReel.commentsCount}", color = Color.White, fontSize = 12.sp)
            }

            // Gift Coins
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                IconButton(
                    onClick = { selectedReelForGift = currentReel },
                    modifier = Modifier
                        .size(44.dp)
                        .background(MaterialTheme.colorScheme.primary, CircleShape)
                ) {
                    Icon(
                        Icons.Filled.MonetizationOn,
                        "Gift Coins",
                        tint = Color.Black,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Text("Gift", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }

            // Share
            IconButton(onClick = { }) {
                Icon(Icons.Outlined.Share, "Share", tint = Color.White, modifier = Modifier.size(28.dp))
            }
        }

        // Creator Info at Bottom Left
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, bottom = 80.dp, end = 80.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = currentReel.creatorAvatar,
                    contentDescription = "Creator",
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        currentReel.creatorName,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 15.sp
                    )
                    Text(
                        currentReel.creatorHandle,
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Button(
                    onClick = { },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                    modifier = Modifier.height(30.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                ) {
                    Text("Follow", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                currentReel.caption,
                color = Color.White,
                fontSize = 13.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.MusicNote, "Music", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    currentReel.soundTitle,
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }

    selectedReelForGift?.let { reel ->
        CoinGiftDialog(
            userCoinsBalance = userCoins,
            onDismiss = { selectedReelForGift = null },
            onSendGift = { amount ->
                onSendGiftToCreator(reel.creatorId, amount)
                selectedReelForGift = null
            }
        )
    }
}
