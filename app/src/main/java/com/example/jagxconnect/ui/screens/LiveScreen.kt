package com.example.jagxconnect.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.jagxconnect.data.model.LiveComment
import com.example.jagxconnect.data.model.LiveRoom
import com.example.jagxconnect.ui.components.CoinGiftDialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveScreen(
    liveRooms: List<LiveRoom>,
    userCoins: Int,
    onSendGiftToHost: (String, Int) -> Unit
) {
    var activeRoom by remember { mutableStateOf<LiveRoom?>(null) }

    if (activeRoom != null) {
        ActiveLiveRoomView(
            room = activeRoom!!,
            userCoins = userCoins,
            onClose = { activeRoom = null },
            onSendGift = { amount -> onSendGiftToHost(activeRoom!!.hostId, amount) }
        )
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("JagX Live Streaming", fontWeight = FontWeight.Bold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
                )
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Button(
                        onClick = {
                            activeRoom = LiveRoom(
                                id = "lr_mine",
                                hostId = "u_me",
                                hostName = "You (Broadcasting)",
                                hostAvatar = "https://picsum.photos/seed/jri/150/150",
                                title = "🔴 My Live Stream Stream Room",
                                viewerCount = 1,
                                category = "General"
                            )
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Filled.Videocam, "Go Live", tint = Color.Black)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Start Live Broadcast", fontWeight = FontWeight.Bold, color = Color.Black)
                    }
                }

                items(liveRooms) { room ->
                    Card(
                        onClick = { activeRoom = room },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(180.dp)
                        ) {
                            AsyncImage(
                                model = "https://picsum.photos/seed/live_${room.id}/600/300",
                                contentDescription = room.title,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.4f))
                            )

                            // Live badge
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color.Red,
                                modifier = Modifier
                                    .padding(12.dp)
                                    .align(Alignment.TopStart)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.FiberManualRecord, "LIVE", tint = Color.White, modifier = Modifier.size(10.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("LIVE", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                }
                            }

                            // Viewers
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color.Black.copy(alpha = 0.6f),
                                modifier = Modifier
                                    .padding(12.dp)
                                    .align(Alignment.TopEnd)
                            ) {
                                Text(
                                    "👁️ ${room.viewerCount}",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }

                            // Title & Host at bottom
                            Column(
                                modifier = Modifier
                                    .align(Alignment.BottomStart)
                                    .padding(12.dp)
                            ) {
                                Text(room.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text("Host: ${room.hostName} • ${room.category}", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ActiveLiveRoomView(
    room: LiveRoom,
    userCoins: Int,
    onClose: () -> Unit,
    onSendGift: (Int) -> Unit
) {
    var comments by remember {
        mutableStateOf(
            listOf(
                LiveComment("1", "Aisha", "https://picsum.photos/seed/aisha/150/150", "Welcome everyone! 🔥"),
                LiveComment("2", "Tunde", "https://picsum.photos/seed/tunde/150/150", "Great broadcast! 👏"),
                LiveComment("3", "Davido_Fan", "https://picsum.photos/seed/dav/150/150", "Sent 100 Coins!", "🪙 100 JagX Coins")
            )
        )
    }
    var newCommentText by remember { mutableStateOf("") }
    var showGiftDialog by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        AsyncImage(
            model = "https://picsum.photos/seed/live_${room.id}/800/1200",
            contentDescription = "Live video feed",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Top controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = room.hostAvatar,
                    contentDescription = "Host",
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(room.hostName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                    Text("👁️ ${room.viewerCount} Viewers", color = Color.White.copy(0.8f), fontSize = 11.sp)
                }
            }

            IconButton(onClick = onClose) {
                Icon(Icons.Filled.Close, "Close Live", tint = Color.White)
            }
        }

        // Floating Comments
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, end = 16.dp, bottom = 80.dp)
                .fillMaxWidth(0.8f)
        ) {
            comments.takeLast(4).forEach { c ->
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Black.copy(alpha = 0.6f),
                    modifier = Modifier.padding(vertical = 3.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("${c.userName}: ", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
                        Text(c.message, color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }

        // Bottom comment & gift bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = newCommentText,
                onValueChange = { newCommentText = it },
                placeholder = { Text("Say something...", color = Color.White.copy(0.6f)) },
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp),
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.Black.copy(0.6f),
                    unfocusedContainerColor = Color.Black.copy(0.6f),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (newCommentText.isNotBlank()) {
                        comments = comments + LiveComment(System.currentTimeMillis().toString(), "You", "", newCommentText)
                        newCommentText = ""
                    }
                }
            ) {
                Icon(Icons.Filled.Send, "Send", tint = MaterialTheme.colorScheme.primary)
            }
            IconButton(
                onClick = { showGiftDialog = true },
                modifier = Modifier.background(MaterialTheme.colorScheme.primary, CircleShape)
            ) {
                Icon(Icons.Filled.MonetizationOn, "Gift", tint = Color.Black)
            }
        }
    }

    if (showGiftDialog) {
        CoinGiftDialog(
            userCoinsBalance = userCoins,
            onDismiss = { showGiftDialog = false },
            onSendGift = { amount ->
                onSendGift(amount)
                comments = comments + LiveComment(System.currentTimeMillis().toString(), "You", "", "Gifted $amount JagX Coins!", "🪙 $amount Coins")
                showGiftDialog = false
            }
        )
    }
}
