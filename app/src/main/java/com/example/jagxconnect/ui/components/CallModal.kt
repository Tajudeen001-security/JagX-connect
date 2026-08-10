package com.example.jagxconnect.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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

@Composable
fun VideoCallModal(
    partnerName: String,
    partnerAvatar: String,
    isVideo: Boolean,
    onEndCall: () -> Unit
) {
    var isMuted by remember { mutableStateOf(false) }
    var isCameraOff by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F13))
    ) {
        if (isVideo && !isCameraOff) {
            AsyncImage(
                model = partnerAvatar,
                contentDescription = "Video Feed",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(0.4f))
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                AsyncImage(
                    model = partnerAvatar,
                    contentDescription = partnerName,
                    modifier = Modifier
                        .size(110.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(partnerName, fontWeight = FontWeight.Bold, fontSize = 22.sp, color = Color.White)
                Text(if (isVideo) "JagX Video Calling..." else "JagX Encrypted Audio Call...", color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
            }
        }

        // Top info
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(partnerName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
            Text("00:42 • HD Encrypted", fontSize = 12.sp, color = Color.White.copy(0.7f))
        }

        // Controls bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 60.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { isMuted = !isMuted },
                modifier = Modifier
                    .size(52.dp)
                    .background(if (isMuted) Color.Red else Color.White.copy(0.2f), CircleShape)
            ) {
                Icon(if (isMuted) Icons.Filled.MicOff else Icons.Filled.Mic, "Mute", tint = Color.White)
            }

            IconButton(
                onClick = onEndCall,
                modifier = Modifier
                    .size(64.dp)
                    .background(Color.Red, CircleShape)
            ) {
                Icon(Icons.Filled.CallEnd, "End Call", tint = Color.White, modifier = Modifier.size(32.dp))
            }

            if (isVideo) {
                IconButton(
                    onClick = { isCameraOff = !isCameraOff },
                    modifier = Modifier
                        .size(52.dp)
                        .background(if (isCameraOff) Color.Red else Color.White.copy(0.2f), CircleShape)
                ) {
                    Icon(if (isCameraOff) Icons.Filled.VideocamOff else Icons.Filled.Videocam, "Camera Toggle", tint = Color.White)
                }
            }
        }
    }
}
