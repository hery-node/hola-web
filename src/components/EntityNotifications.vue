<template>
  <v-menu offset-y max-height="400">
    <template #activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-badge :content="unread_count" :value="unread_count > 0" color="error" overlap>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="350" max-width="350">
      <v-card-title class="text-h6">
        {{ $t("notifications") }}
        <v-spacer></v-spacer>
        <v-btn icon small @click="markAllRead">
          <v-icon small>mdi-check-all</v-icon>
        </v-btn>
      </v-card-title>

      <v-tabs v-model="tab" grow>
        <v-tab>{{ $t("all") }}</v-tab>
        <v-tab>{{ $t("unread") }}</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-list dense>
            <v-list-item v-for="(notification, index) in all_notifications" :key="index" @click="handleNotificationClick(notification)">
              <v-list-item-avatar>
                <v-icon :color="notification.read ? 'grey' : 'primary'">
                  {{ get_notification_icon(notification.type) }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title :class="{ 'font-weight-bold': !notification.read }">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption">
                  {{ format_time(notification.timestamp) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>

        <v-tab-item>
          <v-list dense>
            <v-list-item v-for="(notification, index) in unread_notifications" :key="index" @click="handleNotificationClick(notification)">
              <v-list-item-avatar>
                <v-icon color="primary">{{ get_notification_icon(notification.type) }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ notification.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-menu>
</template>

<script>
/**
 * EntityNotifications Component
 *
 * Entity-based notification center with real-time updates.
 */
export default {
  name: "EntityNotifications",

  data() {
    return {
      tab: 0,
      notifications: [],
    };
  },

  computed: {
    all_notifications() {
      return this.notifications;
    },

    unread_notifications() {
      return this.notifications.filter((n) => !n.read);
    },

    unread_count() {
      return this.unread_notifications.length;
    },
  },

  async mounted() {
    await this.load_notifications();
  },

  methods: {
    async load_notifications() {
      try {
        const response = await this.$axios.get("/notifications");
        this.notifications = response.data;
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    },

    async handleNotificationClick(notification) {
      if (!notification.read) {
        await this.$axios.patch(`/notifications/${notification._id}`, { read: true });
        notification.read = true;
      }
      this.$emit("notification-click", notification);
    },

    async markAllRead() {
      await this.$axios.post("/notifications/mark-all-read");
      this.notifications.forEach((n) => {
        n.read = true;
      });
    },

    get_notification_icon(type) {
      const icons = {
        create: "mdi-plus-circle",
        update: "mdi-pencil",
        delete: "mdi-delete",
        mention: "mdi-at",
      };
      return icons[type] || "mdi-information";
    },

    format_time(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return this.$t("just_now");
      if (minutes < 60) return `${minutes}m`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
      return date.toLocaleDateString();
    },
  },
};
</script>
