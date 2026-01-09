<template>
  <v-card>
    <v-card-title>{{ wizard_title }}</v-card-title>

    <v-stepper v-model="current_step" alt-labels>
      <v-stepper-header>
        <v-stepper-step v-for="(step, index) in steps" :key="`step-${index}`" :complete="current_step > index + 1" :step="index + 1">
          {{ step.title }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content v-for="(step, index) in steps" :key="`content-${index}`" :step="index + 1">
          <v-form ref="stepForm" v-model="step.valid">
            <div v-for="field in step.fields" :key="field.name" class="mb-3">
              <component :is="get_field_component(field)" v-model="entity_data[field.name]" :label="field.label || field.name" :required="field.required" :rules="get_field_rules(field)" v-bind="get_field_props(field)"></component>
            </div>
          </v-form>

          <v-btn v-if="index > 0" text @click="current_step--">{{ $t("back") }}</v-btn>
          <v-btn v-if="index < steps.length - 1" color="primary" :disabled="!step.valid" @click="nextStep">
            {{ $t("next") }}
          </v-btn>
          <v-btn v-else color="primary" :disabled="!step.valid" :loading="submitting" @click="submitWizard">
            {{ $t("submit") }}
          </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <!-- Summary Step -->
    <v-card v-if="show_summary && current_step === steps.length + 1" outlined class="ma-4">
      <v-card-subtitle>{{ $t("summary") }}</v-card-subtitle>
      <v-card-text>
        <div v-for="field in all_fields" :key="field.name" class="mb-2">
          <strong>{{ field.label || field.name }}:</strong> {{ entity_data[field.name] }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="current_step--">{{ $t("back") }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="submitting" @click="submitWizard">
          {{ $t("submit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-card>
</template>

<script>
/**
 * EntityWizard Component
 *
 * Multi-step entity creation/update wizard.
 * Steps defined by field groups in metadata.
 */
import meta from "../mixins/meta";

export default {
  name: "EntityWizard",
  mixins: [meta],

  props: {
    wizardTitle: { type: String, default: "" },
    initialData: { type: Object, default: () => ({}) },
    stepGroups: { type: Array, default: null },
    showSummary: { type: Boolean, default: true },
  },

  data() {
    return {
      current_step: 1,
      entity_data: {},
      submitting: false,
      steps: [],
    };
  },

  computed: {
    wizard_title() {
      return this.wizardTitle || `${this.$t("create")} ${this.entity_label}`;
    },

    all_fields() {
      return this.steps.flatMap((s) => s.fields);
    },
  },

  watch: {
    meta: {
      immediate: true,
      handler() {
        if (this.meta) {
          this.initialize_steps();
        }
      },
    },

    initialData: {
      immediate: true,
      deep: true,
      handler(data) {
        this.entity_data = { ...data };
      },
    },
  },

  async mounted() {
    await this.load_meta();
  },

  methods: {
    initialize_steps() {
      if (this.stepGroups) {
        this.steps = this.stepGroups.map((group) => ({
          title: group.title,
          fields: this.meta.fields.filter((f) => group.fields.includes(f.name)),
          valid: false,
        }));
      } else {
        const chunk_size = 5;
        const fields = this.meta.fields.filter((f) => !["_id"].includes(f.name));
        const chunks = [];

        for (let i = 0; i < fields.length; i += chunk_size) {
          chunks.push(fields.slice(i, i + chunk_size));
        }

        this.steps = chunks.map((chunk, index) => ({
          title: `${this.$t("step")} ${index + 1}`,
          fields: chunk,
          valid: false,
        }));
      }
    },

    get_field_component(field) {
      if (field.type === "boolean") return "v-checkbox";
      if (field.type === "date") return "v-text-field";
      if (field.enum) return "v-select";
      return "v-text-field";
    },

    get_field_props(field) {
      const props = {};
      if (field.type === "date") props.type = "date";
      if (field.enum) props.items = field.enum;
      if (field.type === "number") props.type = "number";
      return props;
    },

    get_field_rules(field) {
      const rules = [];
      if (field.required) {
        rules.push((v) => !!v || `${field.label || field.name} ${this.$t("is_required")}`);
      }
      return rules;
    },

    nextStep() {
      this.current_step++;
    },

    async submitWizard() {
      this.submitting = true;
      try {
        const response = await this.$axios.post(`/${this.entity}`, this.entity_data);
        this.$emit("submitted", response.data);
      } catch (error) {
        console.error("Wizard submit error:", error);
        this.$emit("error", error);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
